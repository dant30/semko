from apps.rules.models import TripClassificationRule


def classify_trip(*, destination="", client=None, quarry=None, material=None):
    rules = TripClassificationRule.objects.filter(is_active=True).select_related(
        "client",
        "quarry",
        "material",
    )

    destination_lower = (destination or "").lower()
    for rule in rules.order_by("priority", "name"):
        if rule.client_id and (not client or rule.client_id != client.id):
            continue
        if rule.quarry_id and (not quarry or rule.quarry_id != quarry.id):
            continue
        if rule.material_id and (not material or rule.material_id != material.id):
            continue
        if rule.destination_keyword and rule.destination_keyword.lower() not in destination_lower:
            continue
        return rule.classification_label
    return ""
