from django.db import models

from apps.core.models import TimeStampedModel


class Client(TimeStampedModel):
    class ClientType(models.TextChoices):
        CORPORATE = "corporate", "Corporate"
        INDIVIDUAL = "individual", "Individual"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    client_type = models.CharField(max_length=20, choices=ClientType.choices)
    contact_person = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20)
    alternate_phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    town = models.CharField(max_length=100, blank=True)
    county = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name", "code"]

    def __str__(self) -> str:
        return self.name
