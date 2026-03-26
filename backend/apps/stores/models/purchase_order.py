from django.db import models
from django.db.models import F, Sum

from apps.core.models import TimeStampedModel


class PurchaseOrderStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_APPROVAL = "pending_approval", "Pending Approval"
    APPROVED = "approved", "Approved"
    PARTIALLY_RECEIVED = "partially_received", "Partially Received"
    CLOSED = "closed", "Closed"
    CANCELLED = "cancelled", "Cancelled"


class PurchaseOrder(TimeStampedModel):
    supplier = models.ForeignKey(
        "stores.Supplier",
        on_delete=models.PROTECT,
        related_name="purchase_orders",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    order_date = models.DateField()
    expected_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PurchaseOrderStatus.choices,
        default=PurchaseOrderStatus.DRAFT,
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-order_date", "-created_at"]

    def __str__(self):
        return f"{self.reference_no} ({self.supplier})"

    @property
    def total_ordered(self):
        return self.lines.aggregate(total=Sum(F("ordered_quantity") * F("unit_cost")))


class PurchaseOrderLine(TimeStampedModel):
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="po_lines",
    )
    ordered_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["purchase_order", "item"]
        unique_together = [("purchase_order", "item")]

    @property
    def remaining_quantity(self):
        return max(self.ordered_quantity - self.received_quantity, 0)

    def __str__(self):
        return f"{self.purchase_order.reference_no} - {self.item.name}"