from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Requisition(TimeStampedModel):
    class RequisitionStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        APPROVED = "approved", "Approved"
        PARTIALLY_ISSUED = "partially_issued", "Partially Issued"
        FULFILLED = "fulfilled", "Fulfilled"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    item = models.ForeignKey(
        "stores.Item",
        on_delete=models.PROTECT,
        related_name="requisitions",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="store_requisitions",
    )
    requested_for = models.CharField(max_length=150)
    quantity_requested = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_approved = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    quantity_issued = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=RequisitionStatus.choices,
        default=RequisitionStatus.PENDING_APPROVAL,
    )
    needed_by = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.reference_no} - {self.item.name}"
