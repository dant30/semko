from decimal import Decimal

from apps.rules.models import PenaltyThresholdRule


def resolve_penalty_rule(percentage_difference):
    absolute_percentage = abs(Decimal(percentage_difference))
    rules = PenaltyThresholdRule.objects.filter(is_active=True).order_by("priority", "minimum_percentage")

    for rule in rules:
        if absolute_percentage < rule.minimum_percentage:
            continue
        if rule.maximum_percentage is not None and absolute_percentage > rule.maximum_percentage:
            continue
        return rule
    return None
