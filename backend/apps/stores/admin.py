from django.contrib import admin

from apps.stores.models import (
    Adjustment,
    Item,
    PurchaseOrder,
    PurchaseOrderLine,
    Requisition,
    StockIssue,
    StockReceiving,
    Supplier,
)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_name", "email", "phone", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "contact_name", "email", "phone")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("reference_no", "supplier", "order_date", "status", "is_active")
    list_filter = ("status", "is_active", "order_date", "supplier")
    search_fields = ("reference_no", "supplier__name", "notes")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PurchaseOrderLine)
class PurchaseOrderLineAdmin(admin.ModelAdmin):
    list_display = ("purchase_order", "item", "ordered_quantity", "received_quantity", "unit_cost", "is_active")
    list_filter = ("is_active", "item", "purchase_order")
    search_fields = ("purchase_order__reference_no", "item__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "category",
        "unit_of_measure",
        "reorder_level",
        "is_active",
    )
    list_filter = ("category", "unit_of_measure", "is_active")
    search_fields = ("name", "code", "description")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StockReceiving)
class StockReceivingAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "item",
        "received_date",
        "quantity",
        "supplier_name",
        "is_active",
    )
    list_filter = ("received_date", "is_active", "item__category")
    search_fields = ("reference_no", "item__name", "supplier_name", "notes")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Requisition)
class RequisitionAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "item",
        "requested_for",
        "requested_by",
        "quantity_requested",
        "quantity_approved",
        "quantity_issued",
        "status",
        "is_active",
    )
    list_filter = ("status", "is_active", "item__category")
    search_fields = ("reference_no", "item__name", "requested_for", "notes")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StockIssue)
class StockIssueAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "item",
        "issue_date",
        "quantity",
        "issued_to_type",
        "issued_to_name",
        "is_active",
    )
    list_filter = ("issued_to_type", "issue_date", "is_active")
    search_fields = ("reference_no", "item__name", "issued_to_name", "purpose")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Adjustment)
class AdjustmentAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "item",
        "adjustment_date",
        "adjustment_type",
        "quantity",
        "is_active",
    )
    list_filter = ("adjustment_type", "adjustment_date", "is_active")
    search_fields = ("reference_no", "item__name", "reason", "notes")
    readonly_fields = ("created_at", "updated_at")
