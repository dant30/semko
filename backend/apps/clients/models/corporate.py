from django.db import models

from apps.core.models import TimeStampedModel


class CorporateClientProfile(TimeStampedModel):
    client = models.OneToOneField(
        "clients.Client",
        on_delete=models.CASCADE,
        related_name="corporate_profile",
        limit_choices_to={"client_type": "corporate"},
    )
    company_registration_number = models.CharField(max_length=100, unique=True)
    kra_pin = models.CharField(max_length=20, unique=True)
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    payment_terms_days = models.PositiveIntegerField(default=30)
    industry = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["client__name"]

    def __str__(self) -> str:
        return f"Corporate Profile - {self.client.name}"
