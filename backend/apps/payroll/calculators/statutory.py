from decimal import Decimal


def placeholder_statutory_deductions():
    return {
        "paye": Decimal("0.00"),
        "nssf": Decimal("0.00"),
        "shif": Decimal("0.00"),
        "housing_levy": Decimal("0.00"),
    }
