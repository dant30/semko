from django.db import models

from apps.core.models import TimeStampedModel


class StockIssue(TimeStampedModel):
    class IssuedToType(models.TextChoices):
        DRIVER = "driver", "Driver"
        VEHICLE = "vehicle", "Vehicle"
        DEPARTMENT = "department", "Department"
        WORKSHOP = "workshop", "Workshop"
        OTHER = "other", "Other"

    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="issues",
    )
    requisition = models.ForeignKey(
        "stores.Requisition",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="issues",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    issued_to_type = models.CharField(max_length=20, choices=IssuedToType.choices)
    issued_to_name = models.CharField(max_length=150)
    purpose = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-issue_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.reference_no} - {self.item.name}"
