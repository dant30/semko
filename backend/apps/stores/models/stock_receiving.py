from django.db import models

from apps.core.models import TimeStampedModel


class StockReceiving(TimeStampedModel):
    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="receivings",
    )
    purchase_order = models.ForeignKey(
        "stores.PurchaseOrder",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receivings",
    )
    purchase_order_line = models.ForeignKey(
        "stores.PurchaseOrderLine",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receivings",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    received_date = models.DateField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    supplier_name = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-received_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.reference_no} - {self.item}"
