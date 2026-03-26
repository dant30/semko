from rest_framework import serializers

from apps.stores.models import Item
from apps.stores.services.stock_level import get_item_stock_snapshot
from apps.stores.utils.reorder import build_reorder_status


class ItemReadSerializer(serializers.ModelSerializer):
    stock_on_hand = serializers.SerializerMethodField()
    is_below_reorder_level = serializers.SerializerMethodField()
    reorder_status = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "code",
            "category",
            "unit_of_measure",
            "description",
            "reorder_level",
            "standard_issue_quantity",
            "is_active",
            "stock_on_hand",
            "is_below_reorder_level",
            "reorder_status",
            "created_at",
            "updated_at",
        ]

    def get_stock_on_hand(self, obj):
        if hasattr(obj, "stock_on_hand") and obj.stock_on_hand is not None:
            return obj.stock_on_hand
        return get_item_stock_snapshot(obj)["stock_on_hand"]

    def get_is_below_reorder_level(self, obj):
        if hasattr(obj, "is_below_reorder_level") and obj.is_below_reorder_level is not None:
            return obj.is_below_reorder_level
        return get_item_stock_snapshot(obj)["is_below_reorder_level"]

    def get_reorder_status(self, obj):
        if hasattr(obj, "reorder_status") and obj.reorder_status is not None:
            return obj.reorder_status
        return build_reorder_status(obj)


class ItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "code",
            "category",
            "unit_of_measure",
            "description",
            "reorder_level",
            "standard_issue_quantity",
            "is_active",
        ]
        read_only_fields = ["id"]
