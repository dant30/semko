from decimal import Decimal

from apps.stores.models import Adjustment


ZERO = Decimal("0.00")


def _sum_active_quantities(related_manager):
    total = ZERO
    for record in related_manager.all():
        if record.is_active:
            total += record.quantity
    return total


def get_item_stock_on_hand(item):
    received_total = _sum_active_quantities(item.receivings)
    issued_total = _sum_active_quantities(item.issues)

    adjustment_total = ZERO
    for adjustment in item.adjustments.all():
        if not adjustment.is_active:
            continue
        if adjustment.adjustment_type == Adjustment.AdjustmentType.INCREASE:
            adjustment_total += adjustment.quantity
        else:
            adjustment_total -= adjustment.quantity

    return received_total + adjustment_total - issued_total


def get_item_stock_snapshot(item):
    stock_on_hand = get_item_stock_on_hand(item)
    reorder_level = item.reorder_level or ZERO
    return {
        "stock_on_hand": stock_on_hand,
        "is_below_reorder_level": stock_on_hand <= reorder_level,
    }
