from django.db import models

from apps.core.models import TimeStampedModel


class PartUsed(TimeStampedModel):
    service_record = models.ForeignKey(
        "maintenance.ServiceRecord",
        on_delete=models.CASCADE,
        related_name="parts_used",
    )
    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="maintenance_part_usage",
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["item__name", "-created_at"]
        unique_together = ("service_record", "item")

    def __str__(self) -> str:
        return f"{self.service_record.reference_no} - {self.item.name}"
