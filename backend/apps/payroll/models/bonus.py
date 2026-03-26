from django.db import models

from apps.core.models import TimeStampedModel


class BonusEarning(TimeStampedModel):
    class BonusType(models.TextChoices):
        CLASSIFICATION = "classification", "Classification"
        BASE_SALARY = "base_salary", "Base Salary"
        ALLOWANCE = "allowance", "Allowance"
        NON_TRIP = "non_trip", "Non Trip"
        OTHER = "other", "Other"

    payslip = models.ForeignKey(
        "payroll.Payslip",
        on_delete=models.CASCADE,
        related_name="bonus_earnings",
    )
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payroll_bonus_earnings",
    )
    bonus_type = models.CharField(max_length=20, choices=BonusType.choices)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.bonus_type} - {self.amount}"
