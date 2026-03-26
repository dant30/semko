from django.db import models

from apps.core.models import TimeStampedModel


class WeighbridgeReading(TimeStampedModel):
    trip = models.OneToOneField(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="weighbridge_reading",
    )
    quarry_gross_weight = models.DecimalField(max_digits=12, decimal_places=2)
    quarry_tare_weight = models.DecimalField(max_digits=12, decimal_places=2)
    quarry_net_weight = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    site_gross_weight = models.DecimalField(max_digits=12, decimal_places=2)
    site_tare_weight = models.DecimalField(max_digits=12, decimal_places=2)
    site_net_weight = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Weighbridge - {self.trip.trip_number}"
