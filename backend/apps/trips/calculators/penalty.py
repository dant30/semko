from decimal import Decimal


DEFAULT_TOLERANCE_PERCENTAGE = Decimal("2.50")


def calculate_net_weight(gross_weight, tare_weight):
    return max(Decimal(gross_weight) - Decimal(tare_weight), Decimal("0"))


def calculate_discrepancy(quarry_net_weight, site_net_weight):
    quarry_net_weight = Decimal(quarry_net_weight)
    site_net_weight = Decimal(site_net_weight)
    difference = quarry_net_weight - site_net_weight
    if quarry_net_weight <= 0:
        return difference, Decimal("0.00")
    percentage = (difference / quarry_net_weight) * Decimal("100")
    return difference, percentage


def calculate_penalty(
    weight_difference,
    agreed_unit_price,
    tolerance_percentage=DEFAULT_TOLERANCE_PERCENTAGE,
):
    weight_difference = abs(Decimal(weight_difference))
    agreed_unit_price = Decimal(agreed_unit_price)
    tolerance_percentage = Decimal(tolerance_percentage)
    if tolerance_percentage <= 0 or agreed_unit_price <= 0:
        return Decimal("0.00")
    return weight_difference * agreed_unit_price
