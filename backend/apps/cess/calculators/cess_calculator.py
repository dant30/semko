from decimal import Decimal


def calculate_cess_amount(rate, quantity):
    if rate.rate_type == rate.RateType.PER_TRIP:
        return Decimal(rate.amount)
    return Decimal(rate.amount) * Decimal(quantity)
