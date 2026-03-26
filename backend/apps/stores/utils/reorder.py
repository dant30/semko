from apps.stores.services.stock_level import get_item_stock_snapshot


def build_reorder_status(item):
    snapshot = get_item_stock_snapshot(item)
    if snapshot["is_below_reorder_level"]:
        return "reorder_required"

    if snapshot["stock_on_hand"] <= (item.reorder_level or 0) * 1.5:
        return "approaching_reorder"

    return "stock_healthy"
