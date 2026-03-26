from django.db import models

from apps.core.models import TimeStampedModel


class Material(TimeStampedModel):
    class MaterialCategory(models.TextChoices):
        AGGREGATE = "aggregate", "Aggregate"
        TARMAC = "tarmac", "Tarmac"
        SAND = "sand", "Sand"
        DUST = "dust", "Dust"
        OTHER = "other", "Other"

    class UnitOfMeasure(models.TextChoices):
        TONNE = "tonne", "Tonne"
        CUBIC_METER = "cubic_meter", "Cubic Meter"
        TRIP = "trip", "Trip"

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=MaterialCategory.choices)
    unit_of_measure = models.CharField(max_length=20, choices=UnitOfMeasure.choices)
    description = models.TextField(blank=True)
    density_factor = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Optional conversion factor for operational calculations.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
