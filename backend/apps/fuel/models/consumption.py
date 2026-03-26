from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class FuelConsumption(TimeStampedModel):
    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="fuel_consumptions",
    )
    period_start = models.DateField()
    period_end = models.DateField()
    opening_odometer = models.DecimalField(max_digits=12, decimal_places=2)
    closing_odometer = models.DecimalField(max_digits=12, decimal_places=2)
    total_litres = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    distance_covered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    km_per_litre = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    litres_per_100km = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-period_end", "-created_at"]
        unique_together = ("vehicle", "period_start", "period_end")

    def __str__(self) -> str:
        return f"{self.vehicle.registration_number} {self.period_start} to {self.period_end}"

    def clean(self):
        if self.period_end < self.period_start:
            raise ValidationError(
                {"period_end": "Period end must be on or after period start."}
            )
        if self.closing_odometer < self.opening_odometer:
            raise ValidationError(
                {
                    "closing_odometer": (
                        "Closing odometer must be greater than or equal to opening odometer."
                    )
                }
            )
        if self.total_litres <= 0:
            raise ValidationError(
                {"total_litres": "Total litres must be greater than zero."}
            )
