from decimal import Decimal

from apps.rules.engine.classifier import classify_trip
from apps.rules.engine.penalty import resolve_penalty_rule
from apps.rules.models import DeductionRule, StatutoryRate
from apps.trips.calculators.penalty import calculate_penalty


def evaluate_trip_rules(*, destination="", client=None, quarry=None, material=None, percentage_difference=None, agreed_unit_price=0, weight_difference=0):
    classification_label = classify_trip(
        destination=destination,
        client=client,
        quarry=quarry,
        material=material,
    )

    penalty_rule = None
    penalty_amount = Decimal("0.00")
    tolerance_percentage = Decimal("2.50")

    if percentage_difference is not None:
        penalty_rule = resolve_penalty_rule(percentage_difference)
        if penalty_rule:
            tolerance_percentage = penalty_rule.tolerance_percentage
            if abs(Decimal(percentage_difference)) > tolerance_percentage:
                penalty_amount = calculate_penalty(
                    weight_difference,
                    agreed_unit_price,
                    tolerance_percentage,
                ) * penalty_rule.penalty_multiplier

    return {
        "classification_label": classification_label,
        "penalty_rule": penalty_rule,
        "tolerance_percentage": tolerance_percentage,
        "penalty_amount": penalty_amount,
    }


def get_active_statutory_rates(as_of_date):
    return StatutoryRate.objects.filter(
        is_active=True,
        effective_from__lte=as_of_date,
    ).exclude(
        effective_to__lt=as_of_date,
    )


def get_active_deduction_rules(as_of_date):
    return DeductionRule.objects.filter(
        is_active=True,
        effective_from__lte=as_of_date,
    ).exclude(
        effective_to__lt=as_of_date,
    )
