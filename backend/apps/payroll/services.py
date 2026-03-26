from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.notifications.models import Notification
from apps.notifications.services.notification_service import dispatch_notification_event
from apps.payroll.calculators.bonus_aggregator import resolve_trip_bonus
from apps.payroll.calculators.net_pay import calculate_net_trip_pay
from apps.payroll.models import (
    BonusEarning,
    Deduction,
    DriverPayrollItem,
    PayrollActionLog,
    PayrollPeriod,
    Payslip,
)
from apps.reports.generators.pdf_generator import build_payslip_pdf_payload
from apps.rules.models import DeductionRule, StatutoryRate
from apps.rules.services import get_active_deduction_rules, get_active_statutory_rates
from apps.trips.models import Trip
from apps.users.models import User


def _driver_trips_for_period(driver, payroll_period):
    return Trip.objects.filter(
        driver=driver,
        trip_date__range=(payroll_period.start_date, payroll_period.end_date),
        is_active=True,
    ).select_related("discrepancy", "cess_transaction", "hired_trip")


def _active_driver_payroll_items(driver, payroll_period):
    return driver.payroll_items.filter(
        is_active=True,
        effective_from__lte=payroll_period.end_date,
    ).exclude(
        effective_to__lt=payroll_period.start_date,
    )


def _resolve_base_amount(rule_apply_on, *, gross_trip_revenue, gross_bonus_earnings, gross_policy_earnings):
    if rule_apply_on in (
        StatutoryRate.ApplyOn.GROSS_TRIP_REVENUE,
        DeductionRule.ApplyOn.GROSS_TRIP_REVENUE,
    ):
        return gross_trip_revenue
    if rule_apply_on in (
        StatutoryRate.ApplyOn.GROSS_BONUS,
        DeductionRule.ApplyOn.GROSS_BONUS,
    ):
        return gross_bonus_earnings
    return gross_policy_earnings


def _calculate_rule_amount(rule, base_amount):
    if rule.calculation_method == rule.CalculationMethod.FIXED:
        amount = rule.rate_value
    else:
        amount = (base_amount * rule.rate_value) / Decimal("100.00")

    minimum_amount = getattr(rule, "minimum_amount", Decimal("0.00")) or Decimal("0.00")
    maximum_amount = getattr(rule, "maximum_amount", None)

    if amount < minimum_amount:
        amount = minimum_amount
    if maximum_amount is not None and amount > maximum_amount:
        amount = maximum_amount
    return amount.quantize(Decimal("0.01"))


def _assert_period_mutable(payroll_period):
    if payroll_period.status == PayrollPeriod.Status.LOCKED:
        raise ValidationError("This payroll period is locked and cannot be modified.")
    if payroll_period.status == PayrollPeriod.Status.APPROVED:
        raise ValidationError("This payroll period has been approved and cannot be regenerated.")


def _payroll_notification_recipients():
    return User.objects.filter(
        is_active=True,
    ).exclude(
        role__isnull=True,
    ).distinct()


def _role_targeted_recipients():
    return User.objects.filter(
        is_active=True,
    ).filter(
        Q(role__code__icontains="finance")
        | Q(role__name__icontains="finance")
        | Q(role__code__icontains="hr")
        | Q(role__name__icontains="hr")
        | Q(role__code__icontains="operation")
        | Q(role__name__icontains="operation")
        | Q(role__code__icontains="ops")
        | Q(role__name__icontains="ops")
        | Q(role__code__icontains="payroll")
        | Q(role__name__icontains="payroll")
    ).distinct()


def _log_payroll_action(*, payroll_period, action, actor=None, comment="", metadata=None):
    return PayrollActionLog.objects.create(
        payroll_period=payroll_period,
        action=action,
        actor=actor,
        comment=comment,
        metadata=metadata or {},
    )


def _notify_payroll_stakeholders(*, title, message, metadata=None):
    recipients = _role_targeted_recipients()
    if not recipients.exists():
        recipients = _payroll_notification_recipients()
    dispatch_notification_event(
        event_code=(metadata or {}).get("event_code", "payroll.generic"),
        category=Notification.Category.PAYROLL,
        recipients=recipients,
        context=metadata or {},
        fallback_title=title,
        fallback_message=message,
    )


def _notify_driver_payslip_ready(*, payslip):
    driver_user = getattr(payslip.driver, "user", None)
    if not driver_user or not driver_user.is_active:
        return
    dispatch_notification_event(
        event_code="payroll.payslip_ready",
        category=Notification.Category.PAYROLL,
        recipients=[driver_user],
        context={
            "payroll_period_id": payslip.payroll_period_id,
            "payslip_id": payslip.id,
            "scope": "self",
            "payroll_period_name": payslip.payroll_period.name,
            "driver_name": payslip.driver.full_name,
            "net_trip_pay": str(payslip.net_trip_pay),
        },
        audience_overrides={driver_user.id: "driver"},
        fallback_title=f"Payslip Ready: {payslip.payroll_period.name}",
        fallback_message=(
            f"Your finalized payslip for {payslip.payroll_period.name} is ready for download."
        ),
    )


def finalize_payslip_documents(*, payroll_period, finalized_by):
    finalized_count = 0
    for payslip in payroll_period.payslips.select_related("driver", "payroll_period"):
        payload = build_payslip_pdf_payload(payslip)
        filename = f"{payroll_period.name.lower().replace(' ', '-')}-{payslip.driver.employee_id}.pdf"
        payslip.finalized_document.save(filename, ContentFile(payload), save=False)
        payslip.finalized_at = timezone.now()
        payslip.finalized_by = finalized_by
        payslip.save(
            update_fields=[
                "finalized_document",
                "finalized_at",
                "finalized_by",
                "updated_at",
            ]
        )
        _notify_driver_payslip_ready(payslip=payslip)
        finalized_count += 1
    return finalized_count


@transaction.atomic
def generate_payslip_for_driver(payroll_period, driver):
    trips = _driver_trips_for_period(driver, payroll_period)
    delivered_trips = trips.filter(status=Trip.Status.DELIVERED)
    verified_trips = delivered_trips.filter(documents_verified=True)
    compensation_profile = getattr(driver, "compensation_profile", None)

    payslip, _created = Payslip.objects.update_or_create(
        payroll_period=payroll_period,
        driver=driver,
        defaults={
            "delivered_trip_count": delivered_trips.count(),
            "verified_trip_count": verified_trips.count(),
            "gross_trip_revenue": sum(
                (trip.agreed_unit_price for trip in delivered_trips),
                Decimal("0.00"),
            ),
            "gross_bonus_earnings": Decimal("0.00"),
            "gross_non_trip_earnings": Decimal("0.00"),
            "gross_policy_earnings": Decimal("0.00"),
            "trip_deduction_total": Decimal("0.00"),
            "policy_deduction_total": Decimal("0.00"),
            "statutory_deduction_total": Decimal("0.00"),
            "total_deductions": Decimal("0.00"),
            "net_trip_pay": Decimal("0.00"),
            "total_cess_reference": sum(
                (
                    trip.cess_transaction.amount
                    for trip in delivered_trips
                    if hasattr(trip, "cess_transaction")
                ),
                Decimal("0.00"),
            ),
            "total_hired_owner_settlement": sum(
                (
                    trip.hired_trip.owner_total_amount
                    for trip in delivered_trips
                    if hasattr(trip, "hired_trip")
                ),
                Decimal("0.00"),
            ),
        },
    )

    payslip.bonus_earnings.all().delete()
    payslip.deductions.all().delete()

    total_bonus = Decimal("0.00")
    non_trip_earnings_total = Decimal("0.00")
    trip_deduction_total = Decimal("0.00")
    policy_deduction_total = Decimal("0.00")
    statutory_deduction_total = Decimal("0.00")

    for trip in verified_trips:
        bonus_amount, description = resolve_trip_bonus(trip)
        if bonus_amount > 0:
            BonusEarning.objects.create(
                payslip=payslip,
                trip=trip,
                bonus_type=BonusEarning.BonusType.CLASSIFICATION,
                description=description or "Trip bonus",
                amount=bonus_amount,
            )
            total_bonus += bonus_amount

    if (
        compensation_profile
        and compensation_profile.is_active
        and compensation_profile.effective_from <= payroll_period.end_date
        and (
            compensation_profile.effective_to is None
            or compensation_profile.effective_to >= payroll_period.start_date
        )
    ):
        if compensation_profile.base_salary > 0:
            BonusEarning.objects.create(
                payslip=payslip,
                bonus_type=BonusEarning.BonusType.BASE_SALARY,
                description="Base salary",
                amount=compensation_profile.base_salary,
            )
            non_trip_earnings_total += compensation_profile.base_salary
        if compensation_profile.per_trip_allowance > 0 and delivered_trips.count() > 0:
            trip_allowance_amount = compensation_profile.per_trip_allowance * delivered_trips.count()
            BonusEarning.objects.create(
                payslip=payslip,
                bonus_type=BonusEarning.BonusType.ALLOWANCE,
                description="Per-trip allowance",
                amount=trip_allowance_amount,
            )
            non_trip_earnings_total += trip_allowance_amount
        if compensation_profile.communication_allowance > 0:
            BonusEarning.objects.create(
                payslip=payslip,
                bonus_type=BonusEarning.BonusType.ALLOWANCE,
                description="Communication allowance",
                amount=compensation_profile.communication_allowance,
            )
            non_trip_earnings_total += compensation_profile.communication_allowance
        if compensation_profile.risk_allowance > 0:
            BonusEarning.objects.create(
                payslip=payslip,
                bonus_type=BonusEarning.BonusType.ALLOWANCE,
                description="Risk allowance",
                amount=compensation_profile.risk_allowance,
            )
            non_trip_earnings_total += compensation_profile.risk_allowance

    for payroll_item in _active_driver_payroll_items(driver, payroll_period):
        if payroll_item.item_type == DriverPayrollItem.ItemType.EARNING and payroll_item.amount > 0:
            BonusEarning.objects.create(
                payslip=payslip,
                bonus_type=BonusEarning.BonusType.NON_TRIP,
                description=payroll_item.description,
                amount=payroll_item.amount,
            )
            non_trip_earnings_total += payroll_item.amount
        elif payroll_item.item_type == DriverPayrollItem.ItemType.DEDUCTION and payroll_item.amount > 0:
            Deduction.objects.create(
                payslip=payslip,
                deduction_type=Deduction.DeductionType.NON_TRIP,
                description=payroll_item.description,
                amount=payroll_item.amount,
            )
            policy_deduction_total += payroll_item.amount

    for trip in delivered_trips:
        penalty_amount = Decimal("0.00")
        if hasattr(trip, "discrepancy"):
            penalty_amount = trip.discrepancy.penalty_amount
        if penalty_amount > 0:
            Deduction.objects.create(
                payslip=payslip,
                trip=trip,
                deduction_type=Deduction.DeductionType.DISCREPANCY,
                description=f"Discrepancy deduction for {trip.trip_number}",
                amount=penalty_amount,
            )
            trip_deduction_total += penalty_amount

    gross_policy_earnings = total_bonus + non_trip_earnings_total

    for deduction_rule in get_active_deduction_rules(payroll_period.end_date).order_by("priority", "name"):
        if deduction_rule.require_verified_documents and verified_trips.count() == 0:
            continue
        if verified_trips.count() < deduction_rule.minimum_verified_trips:
            continue
        base_amount = _resolve_base_amount(
            deduction_rule.apply_on,
            gross_trip_revenue=payslip.gross_trip_revenue,
            gross_bonus_earnings=total_bonus,
            gross_policy_earnings=gross_policy_earnings,
        )
        deduction_amount = _calculate_rule_amount(deduction_rule, base_amount)
        if deduction_amount <= 0:
            continue
        Deduction.objects.create(
            payslip=payslip,
            deduction_type=Deduction.DeductionType.POLICY,
            description=f"{deduction_rule.name} ({deduction_rule.code})",
            amount=deduction_amount,
        )
        policy_deduction_total += deduction_amount

    for statutory_rate in get_active_statutory_rates(payroll_period.end_date).order_by("statutory_type", "name"):
        base_amount = _resolve_base_amount(
            statutory_rate.apply_on,
            gross_trip_revenue=payslip.gross_trip_revenue,
            gross_bonus_earnings=total_bonus,
            gross_policy_earnings=gross_policy_earnings,
        )
        deduction_amount = _calculate_rule_amount(statutory_rate, base_amount)
        if deduction_amount <= 0:
            continue
        Deduction.objects.create(
            payslip=payslip,
            deduction_type=Deduction.DeductionType.STATUTORY,
            description=f"{statutory_rate.name} ({statutory_rate.code})",
            amount=deduction_amount,
        )
        statutory_deduction_total += deduction_amount

    total_deductions = trip_deduction_total + policy_deduction_total + statutory_deduction_total
    payslip.gross_bonus_earnings = total_bonus
    payslip.gross_non_trip_earnings = non_trip_earnings_total
    payslip.gross_policy_earnings = gross_policy_earnings
    payslip.trip_deduction_total = trip_deduction_total
    payslip.policy_deduction_total = policy_deduction_total
    payslip.statutory_deduction_total = statutory_deduction_total
    payslip.total_deductions = total_deductions
    payslip.net_trip_pay = calculate_net_trip_pay(gross_policy_earnings, total_deductions)
    payslip.save(
        update_fields=[
            "gross_bonus_earnings",
            "gross_non_trip_earnings",
            "gross_policy_earnings",
            "trip_deduction_total",
            "policy_deduction_total",
            "statutory_deduction_total",
            "total_deductions",
            "net_trip_pay",
            "updated_at",
        ]
    )
    return payslip


@transaction.atomic
def generate_payslips_for_period(payroll_period, generated_by=None):
    _assert_period_mutable(payroll_period)
    payroll_period.status = PayrollPeriod.Status.PROCESSING
    payroll_period.save(update_fields=["status", "updated_at"])

    trip_driver_ids = list(
        Trip.objects.filter(
            trip_date__range=(payroll_period.start_date, payroll_period.end_date),
            is_active=True,
        )
        .values_list("driver_id", flat=True)
        .distinct()
    )
    compensation_driver_ids = list(
        Payslip.driver.field.related_model.objects.filter(
            compensation_profile__is_active=True,
            compensation_profile__effective_from__lte=payroll_period.end_date,
        )
        .exclude(
            compensation_profile__effective_to__lt=payroll_period.start_date,
        )
        .values_list("id", flat=True)
        .distinct()
    )
    payroll_item_driver_ids = list(
        Payslip.driver.field.related_model.objects.filter(
            payroll_items__is_active=True,
            payroll_items__effective_from__lte=payroll_period.end_date,
        )
        .exclude(
            payroll_items__effective_to__lt=payroll_period.start_date,
        )
        .values_list("id", flat=True)
        .distinct()
    )
    driver_ids = sorted(set(trip_driver_ids + compensation_driver_ids + payroll_item_driver_ids))

    generated = []
    for driver_id in driver_ids:
        from apps.drivers.models import Driver

        driver = Driver.objects.get(pk=driver_id)
        generated.append(generate_payslip_for_driver(payroll_period, driver))

    payroll_period.status = PayrollPeriod.Status.COMPLETED
    payroll_period.save(update_fields=["status", "updated_at"])
    _log_payroll_action(
        payroll_period=payroll_period,
        action=PayrollActionLog.Action.GENERATED,
        actor=generated_by,
        metadata={"payslip_count": len(generated)},
    )
    return generated


@transaction.atomic
def approve_payroll_period(payroll_period, approved_by, comment=""):
    if payroll_period.status != PayrollPeriod.Status.COMPLETED:
        raise ValidationError("Only completed payroll periods can be approved.")
    payroll_period.status = PayrollPeriod.Status.APPROVED
    payroll_period.approved_by = approved_by
    payroll_period.approved_at = timezone.now()
    payroll_period.approval_comment = comment
    payroll_period.save(
        update_fields=[
            "status",
            "approved_by",
            "approved_at",
            "approval_comment",
            "updated_at",
        ]
    )
    _log_payroll_action(
        payroll_period=payroll_period,
        action=PayrollActionLog.Action.APPROVED,
        actor=approved_by,
        comment=comment,
    )
    _notify_payroll_stakeholders(
        title=f"Payroll approved: {payroll_period.name}",
        message=f"{payroll_period.name} has been approved for finance and HR review.",
        metadata={
            "event_code": "payroll.period_approved",
            "payroll_period_id": payroll_period.id,
            "payroll_period_name": payroll_period.name,
            "status": payroll_period.status,
            "approval_comment": comment,
            "approved_by": approved_by.get_full_name() or approved_by.username,
        },
    )
    return payroll_period


@transaction.atomic
def lock_payroll_period(payroll_period, locked_by, note=""):
    if payroll_period.status != PayrollPeriod.Status.APPROVED:
        raise ValidationError("Only approved payroll periods can be locked.")
    finalized_count = finalize_payslip_documents(
        payroll_period=payroll_period,
        finalized_by=locked_by,
    )
    payroll_period.status = PayrollPeriod.Status.LOCKED
    payroll_period.locked_by = locked_by
    payroll_period.locked_at = timezone.now()
    payroll_period.lock_audit_note = note
    payroll_period.save(
        update_fields=[
            "status",
            "locked_by",
            "locked_at",
            "lock_audit_note",
            "updated_at",
        ]
    )
    _log_payroll_action(
        payroll_period=payroll_period,
        action=PayrollActionLog.Action.FINALIZED,
        actor=locked_by,
        metadata={"finalized_payslip_count": finalized_count},
    )
    _log_payroll_action(
        payroll_period=payroll_period,
        action=PayrollActionLog.Action.LOCKED,
        actor=locked_by,
        comment=note,
        metadata={"finalized_payslip_count": finalized_count},
    )
    _notify_payroll_stakeholders(
        title=f"Payroll locked: {payroll_period.name}",
        message=f"{payroll_period.name} has been locked and finalized payslips are now available.",
        metadata={
            "event_code": "payroll.period_locked",
            "payroll_period_id": payroll_period.id,
            "payroll_period_name": payroll_period.name,
            "status": payroll_period.status,
            "finalized_payslip_count": finalized_count,
            "lock_audit_note": note,
            "locked_by": locked_by.get_full_name() or locked_by.username,
        },
    )
    return payroll_period
