from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class MaterialPrice(TimeStampedModel):
    material = models.ForeignKey(
        "materials.Material",
        on_delete=models.CASCADE,
        related_name="prices",
    )
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="KES")
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-effective_from", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["material", "effective_from"],
                name="unique_material_effective_from",
            )
        ]

    def __str__(self) -> str:
        return f"{self.material.name} @ {self.price_per_unit} {self.currency}"

    def clean(self):
        if self.price_per_unit <= 0:
            raise ValidationError(
                {"price_per_unit": "Price per unit must be greater than zero."}
            )
        if self.effective_to and self.effective_to < self.effective_from:
            raise ValidationError(
                {"effective_to": "Effective end date cannot be earlier than effective_from."}
            )
