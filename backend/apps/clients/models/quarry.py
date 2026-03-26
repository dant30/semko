from django.db import models

from apps.core.models import TimeStampedModel


class Quarry(TimeStampedModel):
    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=100, unique=True)
    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quarries",
    )
    county = models.CharField(max_length=100)
    town = models.CharField(max_length=100, blank=True)
    location_description = models.TextField(blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
