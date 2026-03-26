from django.db import models

from apps.core.models import TimeStampedModel


class Discrepancy(TimeStampedModel):
    trip = models.OneToOneField(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="discrepancy",
    )
    weight_difference = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    percentage_difference = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tolerance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.5)
    penalty_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    within_tolerance = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Discrepancy - {self.trip.trip_number}"
