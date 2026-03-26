from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class PayrollPeriod(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        APPROVED = "approved", "Approved"
        LOCKED = "locked", "Locked"

    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    notes = models.TextField(blank=True)
    approval_comment = models.TextField(blank=True)
    lock_audit_note = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_payroll_periods",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="locked_payroll_periods",
    )
    locked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return self.name

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date cannot be earlier than start date."})
