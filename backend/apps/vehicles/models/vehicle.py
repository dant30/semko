from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedModel


class Vehicle(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        MAINTENANCE = "maintenance", "Maintenance"
        RETIRED = "retired", "Retired"

    registration_number = models.CharField(max_length=20, unique=True)
    fleet_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.ForeignKey(
        "vehicles.VehicleType",
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    ownership = models.ForeignKey(
        "vehicles.VehicleOwnership",
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100, blank=True)
    year = models.PositiveSmallIntegerField()
    chassis_number = models.CharField(max_length=100, unique=True)
    engine_number = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    capacity_tonnes = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    insurance_expiry = models.DateField(null=True, blank=True)
    inspection_expiry = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["registration_number"]

    def __str__(self) -> str:
        return f"{self.registration_number} - {self.make}"

    def clean(self):
        current_year = timezone.now().year + 1
        if self.year < 1980 or self.year > current_year:
            raise ValidationError(
                {"year": f"Vehicle year must be between 1980 and {current_year}."}
            )
