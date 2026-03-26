from django.db import models

from apps.core.models import TimeStampedModel


class DriverCompensationProfile(TimeStampedModel):
    driver = models.OneToOneField(
        "drivers.Driver",
        on_delete=models.CASCADE,
        related_name="compensation_profile",
    )
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    per_trip_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    communication_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    risk_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["driver__first_name", "driver__last_name"]

    def __str__(self) -> str:
        return f"{self.driver.full_name} Compensation Profile"
