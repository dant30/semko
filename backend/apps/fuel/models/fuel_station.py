from django.db import models

from apps.core.models import TimeStampedModel


class FuelStation(TimeStampedModel):
    class StationType(models.TextChoices):
        INTERNAL = "internal", "Internal"
        EXTERNAL = "external", "External"

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=100, unique=True)
    station_type = models.CharField(max_length=20, choices=StationType.choices)
    location = models.CharField(max_length=255, blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
