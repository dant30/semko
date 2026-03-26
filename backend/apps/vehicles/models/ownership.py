from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class VehicleOwnership(TimeStampedModel):
    class OwnershipType(models.TextChoices):
        OWNED = "owned", "Owned"
        HIRED = "hired", "Hired"
        LEASED = "leased", "Leased"

    name = models.CharField(max_length=150)
    ownership_type = models.CharField(max_length=20, choices=OwnershipType.choices)
    contact_person = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    contract_reference = models.CharField(max_length=100, blank=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name", "-effective_from"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_ownership_type_display()})"

    def clean(self):
        if self.effective_to and self.effective_to < self.effective_from:
            raise ValidationError(
                {"effective_to": "End date cannot be earlier than effective_from."}
            )
