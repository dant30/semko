from django.db import models

from apps.core.models import TimeStampedModel


class Adjustment(TimeStampedModel):
    class AdjustmentType(models.TextChoices):
        INCREASE = "increase", "Increase"
        DECREASE = "decrease", "Decrease"

    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="adjustments",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    adjustment_date = models.DateField()
    adjustment_type = models.CharField(
        max_length=10,
        choices=AdjustmentType.choices,
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-adjustment_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.reference_no} - {self.item.name}"
