from django.contrib import admin

from apps.payroll.models import (
    BonusEarning,
    Deduction,
    DriverCompensationProfile,
    DriverPayrollItem,
    PayrollActionLog,
    PayrollPeriod,
    Payslip,
)


class BonusEarningInline(admin.TabularInline):
    model = BonusEarning
    extra = 0


class DeductionInline(admin.TabularInline):
    model = Deduction
    extra = 0


class PayrollActionLogInline(admin.TabularInline):
    model = PayrollActionLog
    extra = 0
    readonly_fields = ("action", "actor", "comment", "metadata", "created_at", "updated_at")


@admin.register(PayrollPeriod)
class PayrollPeriodAdmin(admin.ModelAdmin):
    list_display = ("name", "start_date", "end_date", "status", "approved_by", "locked_by")
    list_filter = ("status",)
    search_fields = ("name",)
    readonly_fields = (
        "approval_comment",
        "approved_at",
        "lock_audit_note",
        "locked_at",
        "created_at",
        "updated_at",
    )
    inlines = [PayrollActionLogInline]


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = (
        "payroll_period",
        "driver",
        "verified_trip_count",
        "gross_bonus_earnings",
        "gross_non_trip_earnings",
        "total_deductions",
        "net_trip_pay",
    )
    list_filter = ("payroll_period",)
    search_fields = ("driver__first_name", "driver__last_name", "payroll_period__name")
    readonly_fields = ("finalized_document", "finalized_at", "finalized_by", "created_at", "updated_at")
    inlines = [BonusEarningInline, DeductionInline]


@admin.register(DriverCompensationProfile)
class DriverCompensationProfileAdmin(admin.ModelAdmin):
    list_display = (
        "driver",
        "base_salary",
        "per_trip_allowance",
        "communication_allowance",
        "risk_allowance",
        "effective_from",
        "is_active",
    )
    list_filter = ("is_active",)
    search_fields = ("driver__first_name", "driver__last_name", "driver__employee_id")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DriverPayrollItem)
class DriverPayrollItemAdmin(admin.ModelAdmin):
    list_display = ("driver", "item_type", "description", "amount", "recurrence", "effective_from", "is_active")
    list_filter = ("item_type", "recurrence", "is_active")
    search_fields = ("driver__first_name", "driver__last_name", "description")
    readonly_fields = ("created_at", "updated_at")
