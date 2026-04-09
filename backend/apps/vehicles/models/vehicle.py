from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedModel
from apps.vehicles.constants import FuelType, VehicleStatus


class Vehicle(TimeStampedModel):
    """
    Main vehicle record.
    """

    registration_number = models.CharField(max_length=20, unique=True)
    vin = models.CharField(max_length=50, unique=True, verbose_name="VIN/Chassis Number")
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    fuel_type = models.CharField(max_length=20, choices=FuelType.CHOICES, default=FuelType.DIESEL)
    status = models.CharField(
        max_length=20,
        choices=VehicleStatus.CHOICES,
        default=VehicleStatus.ACTIVE,
    )
    vehicle_type = models.ForeignKey(
        "vehicles.VehicleType",
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    current_mileage_km = models.PositiveIntegerField(default=0)
    seating_capacity = models.PositiveSmallIntegerField(default=2)
    load_capacity_tonnes = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    color = models.CharField(max_length=50, blank=True)
    engine_number = models.CharField(max_length=50, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_due_km = models.PositiveIntegerField(null=True, blank=True)
    next_maintenance_due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["registration_number"]
        indexes = [
            models.Index(fields=["status", "is_active"]),
            models.Index(fields=["vehicle_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.registration_number} - {self.make} {self.model} ({self.year})"

    def clean(self):
        if self.year > timezone.now().year:
            raise ValidationError({"year": "Year cannot be in the future."})
        if self.current_mileage_km < 0:
            raise ValidationError({"current_mileage_km": "Mileage cannot be negative."})
        if self.next_maintenance_due_km and self.next_maintenance_due_km <= self.current_mileage_km:
            raise ValidationError(
                {"next_maintenance_due_km": "Next maintenance due km must be greater than current mileage."}
            )
        if self.next_maintenance_due_date and self.next_maintenance_due_date <= timezone.now().date():
            raise ValidationError(
                {"next_maintenance_due_date": "Next maintenance due date must be in the future."}
            )

    @property
    def is_available(self) -> bool:
        """Check if vehicle can be assigned to a trip."""
        return self.status == VehicleStatus.ACTIVE and self.is_active
