# backend/apps/vehicles/models/ownership.py
from django.db import models

from apps.core.models import TimeStampedModel
from apps.vehicles.constants import OwnershipType


class VehicleOwnership(TimeStampedModel):
    """
    Ownership details for a vehicle. One-to-one with Vehicle.
    Keeps lease/contract information separate for clean data.
    """

    vehicle = models.OneToOneField(
        "vehicles.Vehicle",
        on_delete=models.CASCADE,
        related_name="ownership",
    )
    ownership_type = models.CharField(
        max_length=20,
        choices=OwnershipType.CHOICES,
        default=OwnershipType.COMPANY_OWNED,
    )
    owner_name = models.CharField(max_length=200, blank=True, help_text="Leasing company or owner")
    lease_start_date = models.DateField(null=True, blank=True)
    lease_end_date = models.DateField(null=True, blank=True)
    monthly_lease_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    registration_document_number = models.CharField(max_length=100, blank=True)
    insurance_provider = models.CharField(max_length=150, blank=True)
    insurance_policy_number = models.CharField(max_length=100, blank=True)
    insurance_expiry_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Vehicle Ownership"
        verbose_name_plural = "Vehicle Ownerships"
        indexes = [
            models.Index(fields=["ownership_type"]),
            models.Index(fields=["insurance_expiry_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.vehicle.registration_number} - {self.get_ownership_type_display()}"
