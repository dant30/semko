from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class CessRate(TimeStampedModel):
    class RateType(models.TextChoices):
        PER_TRIP = "per_trip", "Per Trip"
        PER_TONNE = "per_tonne", "Per Tonne"
        PER_CUBIC_METER = "per_cubic_meter", "Per Cubic Meter"

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    county = models.CharField(max_length=100)
    material = models.ForeignKey(
        "materials.Material",
        on_delete=models.PROTECT,
        related_name="cess_rates",
    )
    rate_type = models.CharField(max_length=20, choices=RateType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["county", "material__name", "-effective_from"]

    def __str__(self) -> str:
        return f"{self.county} - {self.material.name}"

    def clean(self):
        if self.amount <= 0:
            raise ValidationError({"amount": "Cess amount must be greater than zero."})
        if self.effective_to and self.effective_to < self.effective_from:
            raise ValidationError(
                {"effective_to": "Effective end date cannot be earlier than effective_from."}
            )
