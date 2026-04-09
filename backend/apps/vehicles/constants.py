# backend/apps/vehicles/constants.py
from django.db import models


class VehicleStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    UNDER_MAINTENANCE = "under_maintenance", "Under Maintenance"
    RETIRED = "retired", "Retired"
    STANDBY = "standby", "Standby"


# Fuel type choices
class FuelType(models.TextChoices):
    PETROL = "petrol", "Petrol"
    DIESEL = "diesel", "Diesel"
    ELECTRIC = "electric", "Electric"
    HYBRID = "hybrid", "Hybrid"
    CNG = "cng", "Compressed Natural Gas"


# Ownership type
class OwnershipType(models.TextChoices):
    COMPANY_OWNED = "company_owned", "Company Owned"
    LEASED = "leased", "Leased"
    CONTRACT_HIRE = "contract_hire", "Contract Hire"
    OTHER = "other", "Other"


VehicleStatus.CHOICES = VehicleStatus.choices
FuelType.CHOICES = FuelType.choices
OwnershipType.CHOICES = OwnershipType.choices
