from django.db import models

from apps.core.models import TimeStampedModel


class HiredTrip(TimeStampedModel):
    trip = models.OneToOneField(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="hired_trip",
    )
    owner_name = models.CharField(max_length=150)
    owner_rate_per_trip = models.DecimalField(max_digits=12, decimal_places=2)
    owner_total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    settlement_status = models.CharField(max_length=20, default="pending")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Hired Trip - {self.trip.trip_number}"
