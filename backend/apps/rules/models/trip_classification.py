from django.db import models

from apps.core.models import TimeStampedModel


class TripClassificationRule(TimeStampedModel):
    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    classification_label = models.CharField(max_length=100)
    destination_keyword = models.CharField(max_length=100, blank=True)
    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trip_classification_rules",
    )
    quarry = models.ForeignKey(
        "clients.Quarry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trip_classification_rules",
    )
    material = models.ForeignKey(
        "materials.Material",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trip_classification_rules",
    )
    bonus_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    priority = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["priority", "name"]

    def __str__(self) -> str:
        return f"{self.classification_label} ({self.code})"
