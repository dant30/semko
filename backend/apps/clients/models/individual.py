from django.db import models

from apps.core.models import TimeStampedModel


class IndividualClientProfile(TimeStampedModel):
    client = models.OneToOneField(
        "clients.Client",
        on_delete=models.CASCADE,
        related_name="individual_profile",
        limit_choices_to={"client_type": "individual"},
    )
    national_id = models.CharField(max_length=30, unique=True)
    kra_pin = models.CharField(max_length=20, blank=True)
    occupation = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["client__name"]

    def __str__(self) -> str:
        return f"Individual Profile - {self.client.name}"
