from decimal import Decimal, ROUND_HALF_UP


ZERO = Decimal("0.00")
HUNDRED = Decimal("100.00")


def _round(value):
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_efficiency_metrics(opening_odometer, closing_odometer, total_litres, total_cost):
    distance_covered = closing_odometer - opening_odometer
    if total_litres <= 0:
        return {
            "distance_covered": _round(distance_covered),
            "km_per_litre": ZERO,
            "litres_per_100km": ZERO,
            "total_cost": _round(total_cost),
        }

    km_per_litre = distance_covered / total_litres if total_litres else ZERO
    litres_per_100km = (total_litres / distance_covered) * HUNDRED if distance_covered > 0 else ZERO
    return {
        "distance_covered": _round(distance_covered),
        "km_per_litre": _round(km_per_litre) if km_per_litre else ZERO,
        "litres_per_100km": _round(litres_per_100km) if litres_per_100km else ZERO,
        "total_cost": _round(total_cost),
    }
