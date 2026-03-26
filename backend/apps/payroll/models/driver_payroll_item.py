from django.db import models

from apps.core.models import TimeStampedModel


class DriverPayrollItem(TimeStampedModel):
    class ItemType(models.TextChoices):
        EARNING = "earning", "Earning"
        DEDUCTION = "deduction", "Deduction"

    class Recurrence(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        ONE_OFF = "one_off", "One Off"

    driver = models.ForeignKey(
        "drivers.Driver",
        on_delete=models.CASCADE,
        related_name="payroll_items",
    )
    item_type = models.CharField(max_length=20, choices=ItemType.choices)
    recurrence = models.CharField(
        max_length=20,
        choices=Recurrence.choices,
        default=Recurrence.MONTHLY,
    )
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["driver__first_name", "driver__last_name", "description"]

    def __str__(self) -> str:
        return f"{self.driver.full_name} - {self.description}"
