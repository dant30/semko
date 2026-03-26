from decimal import Decimal


def calculate_net_trip_pay(gross_bonus_earnings, total_deductions):
    return Decimal(gross_bonus_earnings) - Decimal(total_deductions)
