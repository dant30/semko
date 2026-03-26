from decimal import Decimal

from apps.rules.models import TripClassificationRule


def resolve_trip_bonus(trip):
    if not trip.classification_label:
        return Decimal("0.00"), ""

    rule = (
        TripClassificationRule.objects.filter(
            classification_label=trip.classification_label,
            is_active=True,
        )
        .order_by("priority", "name")
        .first()
    )
    if not rule:
        return Decimal("0.00"), ""
    return Decimal(rule.bonus_amount), f"Classification bonus: {rule.classification_label}"
