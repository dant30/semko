from django.db.models import F
from rest_framework import serializers

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
from apps.stores.services.stock_level import get_item_stock_on_hand


class StockReceivingSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    purchase_order_reference = serializers.CharField(
        source="purchase_order.reference_no", read_only=True
    )
    purchase_order_line_id = serializers.IntegerField(
        source="purchase_order_line.id", read_only=True
    )

    class Meta:
        model = StockReceiving
        fields = [
            "id",
            "item",
            "item_name",
            "purchase_order",
            "purchase_order_reference",
            "purchase_order_line",
            "purchase_order_line_id",
            "reference_no",
            "received_date",
            "quantity",
            "unit_cost",
            "supplier_name",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "item_name", "purchase_order_reference", "purchase_order_line_id"]


class StockReceivingWriteSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())
    purchase_order_id = serializers.PrimaryKeyRelatedField(
        source="purchase_order",
        queryset=PurchaseOrder.objects.all(),
        required=False,
        allow_null=True,
    )
    purchase_order_line_id = serializers.PrimaryKeyRelatedField(
        source="purchase_order_line",
        queryset=PurchaseOrderLine.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StockReceiving
        fields = [
            "id",
            "item_id",
            "purchase_order_id",
            "purchase_order_line_id",
            "reference_no",
            "received_date",
            "quantity",
            "unit_cost",
            "supplier_name",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        item = attrs.get("item", getattr(self.instance, "item", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        po_line = attrs.get("purchase_order_line", getattr(self.instance, "purchase_order_line", None))

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Received quantity must be greater than zero."}
            )

        if po_line is not None:
            if item and po_line.item_id != item.id:
                raise serializers.ValidationError(
                    {"purchase_order_line_id": "PO line item must match receiving item."}
                )
            remaining = po_line.remaining_quantity
            if self.instance and self.instance.is_active and self.instance.purchase_order_line_id == po_line.id:
                remaining += self.instance.quantity
            if quantity is not None and quantity > remaining:
                raise serializers.ValidationError(
                    {"quantity": "Received quantity exceeds open PO line balance."}
                )

        return attrs

    def create(self, validated_data):
        receiving = super().create(validated_data)
        if receiving.purchase_order_line and receiving.is_active:
            receiving.purchase_order_line.received_quantity = F("received_quantity") + receiving.quantity
            receiving.purchase_order_line.save(update_fields=["received_quantity"])
        return receiving

    def update(self, instance, validated_data):
        previous_quantity = instance.quantity if instance.is_active else 0
        receiving = super().update(instance, validated_data)

        if receiving.purchase_order_line:
            # Update line received quantity to reflect changed receiving amount.
            diff = receiving.quantity - previous_quantity
            if diff != 0:
                po_line = receiving.purchase_order_line
                po_line.received_quantity = F("received_quantity") + diff
                po_line.save(update_fields=["received_quantity"])

        return receiving


class RequisitionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    requested_by_username = serializers.CharField(
        source="requested_by.username",
        read_only=True,
    )
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = Requisition
        fields = [
            "id",
            "item",
            "item_name",
            "reference_no",
            "requested_by",
            "requested_by_username",
            "requested_for",
            "quantity_requested",
            "quantity_approved",
            "quantity_issued",
            "status",
            "needed_by",
            "notes",
            "is_active",
            "available_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "requested_by",
            "requested_by_username",
            "quantity_issued",
            "available_stock",
            "created_at",
            "updated_at",
            "item_name",
        ]

    def get_available_stock(self, obj):
        return get_item_stock_on_hand(obj.item)


class RequisitionWriteSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())

    class Meta:
        model = Requisition
        fields = [
            "id",
            "item_id",
            "reference_no",
            "requested_for",
            "quantity_requested",
            "quantity_approved",
            "status",
            "needed_by",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)
        quantity_requested = attrs.get(
            "quantity_requested",
            getattr(instance, "quantity_requested", None),
        )
        quantity_approved = attrs.get(
            "quantity_approved",
            getattr(instance, "quantity_approved", None),
        )
        status_value = attrs.get("status", getattr(instance, "status", None))

        if quantity_requested is not None and quantity_requested <= 0:
            raise serializers.ValidationError(
                {"quantity_requested": "Requested quantity must be greater than zero."}
            )
        if quantity_approved is not None:
            if quantity_approved <= 0:
                raise serializers.ValidationError(
                    {"quantity_approved": "Approved quantity must be greater than zero."}
                )
            if quantity_requested is not None and quantity_approved > quantity_requested:
                raise serializers.ValidationError(
                    {
                        "quantity_approved": (
                            "Approved quantity cannot exceed requested quantity."
                        )
                    }
                )
        if status_value in {
            Requisition.RequisitionStatus.APPROVED,
            Requisition.RequisitionStatus.PARTIALLY_ISSUED,
            Requisition.RequisitionStatus.FULFILLED,
        } and quantity_approved is None:
            raise serializers.ValidationError(
                {"quantity_approved": "Approved quantity is required for this status."}
            )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return Requisition.objects.create(requested_by=request.user, **validated_data)


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "contact_name",
            "email",
            "phone",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SupplierWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "contact_name",
            "email",
            "phone",
            "address",
            "is_active",
        ]
        read_only_fields = ["id"]


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = PurchaseOrderLine
        fields = [
            "id",
            "item",
            "item_name",
            "ordered_quantity",
            "received_quantity",
            "unit_cost",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "received_quantity", "created_at", "updated_at", "item_name"]


class PurchaseOrderLineWriteSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())

    class Meta:
        model = PurchaseOrderLine
        fields = [
            "id",
            "item_id",
            "ordered_quantity",
            "unit_cost",
            "is_active",
        ]
        read_only_fields = ["id"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "reference_no",
            "order_date",
            "expected_date",
            "status",
            "notes",
            "is_active",
            "total_ordered",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "supplier_name", "total_ordered", "created_at", "updated_at", "lines"]


class PurchaseOrderWriteSerializer(serializers.ModelSerializer):
    line_items = PurchaseOrderLineWriteSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "supplier",
            "reference_no",
            "order_date",
            "expected_date",
            "status",
            "notes",
            "is_active",
            "line_items",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        lines = validated_data.pop("line_items", [])
        po = PurchaseOrder.objects.create(**validated_data)
        for line in lines:
            PurchaseOrderLine.objects.create(purchase_order=po, **line)
        return po

    def update(self, instance, validated_data):
        lines = validated_data.pop("line_items", None)
        po = super().update(instance, validated_data)
        if lines is not None:
            po.lines.all().delete()
            PurchaseOrderLine.objects.bulk_create(
                PurchaseOrderLine(purchase_order=po, **line) for line in lines
            )
        return po


class StockIssueSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    requisition_reference = serializers.CharField(
        source="requisition.reference_no",
        read_only=True,
    )

    class Meta:
        model = StockIssue
        fields = [
            "id",
            "item",
            "item_name",
            "requisition",
            "requisition_reference",
            "reference_no",
            "issue_date",
            "quantity",
            "unit_cost",
            "issued_to_type",
            "issued_to_name",
            "purpose",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "item_name",
            "requisition_reference",
        ]


class StockIssueWriteSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())
    requisition_id = serializers.PrimaryKeyRelatedField(
        source="requisition",
        queryset=Requisition.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StockIssue
        fields = [
            "id",
            "item_id",
            "requisition_id",
            "reference_no",
            "issue_date",
            "quantity",
            "unit_cost",
            "issued_to_type",
            "issued_to_name",
            "purpose",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        item = attrs.get("item", getattr(self.instance, "item", None))
        requisition = attrs.get("requisition", getattr(self.instance, "requisition", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Issued quantity must be greater than zero."}
            )

        if item and quantity is not None:
            available_stock = get_item_stock_on_hand(item)
            if self.instance and self.instance.is_active:
                available_stock += self.instance.quantity
            if quantity > available_stock:
                raise serializers.ValidationError(
                    {"quantity": "Issued quantity exceeds available stock."}
                )

        if requisition:
            if item and requisition.item_id != item.id:
                raise serializers.ValidationError(
                    {"requisition_id": "Requisition item must match issue item."}
                )
            if requisition.status not in {
                Requisition.RequisitionStatus.APPROVED,
                Requisition.RequisitionStatus.PARTIALLY_ISSUED,
            }:
                raise serializers.ValidationError(
                    {"requisition_id": "Only approved requisitions can be issued."}
                )
            remaining_quantity = (requisition.quantity_approved or 0) - requisition.quantity_issued
            if self.instance and self.instance.requisition_id == requisition.id and self.instance.is_active:
                remaining_quantity += self.instance.quantity
            if quantity is not None and quantity > remaining_quantity:
                raise serializers.ValidationError(
                    {"quantity": "Issued quantity exceeds the approved requisition balance."}
                )
        return attrs

    def create(self, validated_data):
        issue = StockIssue.objects.create(**validated_data)
        self._apply_requisition_issue(issue)
        return issue

    def update(self, instance, validated_data):
        previous_quantity = instance.quantity if instance.is_active else 0
        issue = super().update(instance, validated_data)
        if issue.requisition:
            requisition = issue.requisition
            requisition.quantity_issued = max(
                0,
                requisition.quantity_issued - previous_quantity + issue.quantity,
            )
            self._set_requisition_status(requisition)
            requisition.save(update_fields=["quantity_issued", "status", "updated_at"])
        return issue

    def _apply_requisition_issue(self, issue):
        if not issue.requisition:
            return
        requisition = issue.requisition
        requisition.quantity_issued += issue.quantity
        self._set_requisition_status(requisition)
        requisition.save(update_fields=["quantity_issued", "status", "updated_at"])

    def _set_requisition_status(self, requisition):
        approved_quantity = requisition.quantity_approved or 0
        if requisition.quantity_issued >= approved_quantity:
            requisition.status = Requisition.RequisitionStatus.FULFILLED
        elif requisition.quantity_issued > 0:
            requisition.status = Requisition.RequisitionStatus.PARTIALLY_ISSUED
        elif approved_quantity > 0:
            requisition.status = Requisition.RequisitionStatus.APPROVED


class AdjustmentSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = Adjustment
        fields = [
            "id",
            "item",
            "item_name",
            "reference_no",
            "adjustment_date",
            "adjustment_type",
            "quantity",
            "reason",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "item_name"]


class AdjustmentWriteSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())

    class Meta:
        model = Adjustment
        fields = [
            "id",
            "item_id",
            "reference_no",
            "adjustment_date",
            "adjustment_type",
            "quantity",
            "reason",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        item = attrs.get("item", getattr(self.instance, "item", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        adjustment_type = attrs.get(
            "adjustment_type",
            getattr(self.instance, "adjustment_type", None),
        )

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Adjustment quantity must be greater than zero."}
            )

        if (
            item
            and quantity is not None
            and adjustment_type == Adjustment.AdjustmentType.DECREASE
        ):
            available_stock = get_item_stock_on_hand(item)
            if (
                self.instance
                and self.instance.is_active
                and self.instance.adjustment_type == Adjustment.AdjustmentType.DECREASE
            ):
                available_stock += self.instance.quantity
            if quantity > available_stock:
                raise serializers.ValidationError(
                    {"quantity": "Adjustment quantity exceeds available stock."}
                )
        return attrs
