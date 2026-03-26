from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class PenaltyThresholdRule(TimeStampedModel):
    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    minimum_percentage = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    maximum_percentage = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    tolerance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.5)
    penalty_multiplier = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)
    priority = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["priority", "minimum_percentage"]

    def __str__(self) -> str:
        return self.name

    def clean(self):
        if self.maximum_percentage is not None and self.maximum_percentage < self.minimum_percentage:
            raise ValidationError(
                {"maximum_percentage": "Maximum percentage must be greater than or equal to minimum percentage."}
            )
