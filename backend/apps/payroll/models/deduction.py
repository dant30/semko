from django.db import models

from apps.core.models import TimeStampedModel


class Deduction(TimeStampedModel):
    class DeductionType(models.TextChoices):
        DISCREPANCY = "discrepancy", "Discrepancy"
        STATUTORY = "statutory", "Statutory"
        POLICY = "policy", "Policy"
        NON_TRIP = "non_trip", "Non Trip"
        OTHER = "other", "Other"

    payslip = models.ForeignKey(
        "payroll.Payslip",
        on_delete=models.CASCADE,
        related_name="deductions",
    )
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payroll_deductions",
    )
    deduction_type = models.CharField(max_length=20, choices=DeductionType.choices)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.deduction_type} - {self.amount}"
