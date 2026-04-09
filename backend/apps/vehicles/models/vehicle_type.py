# backend/apps/vehicles/models/vehicle_type.py
from django.db import models

from apps.core.models import TimeStampedModel


class VehicleType(TimeStampedModel):
    """
    Classification of vehicles (e.g., Truck, Trailer, Tanker, Pickup).
    Helps define capacity, dimensions, and operational rules.
    """

    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    max_load_tonnes = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Maximum load capacity in metric tonnes"
    )
    max_volume_cubic_meters = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Maximum cargo volume in cubic meters"
    )
    typical_fuel_consumption_l_per_100km = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text="Average litres per 100 km"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Vehicle Type"
        verbose_name_plural = "Vehicle Types"

    def __str__(self) -> str:
        return self.name
