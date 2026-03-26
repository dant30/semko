from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class DriverLicense(TimeStampedModel):
    class LicenseStatus(models.TextChoices):
        VALID = "valid", "Valid"
        EXPIRED = "expired", "Expired"
        SUSPENDED = "suspended", "Suspended"
        REVOKED = "revoked", "Revoked"

    driver = models.OneToOneField(
        "drivers.Driver",
        on_delete=models.CASCADE,
        related_name="license",
    )
    license_number = models.CharField(max_length=50, unique=True)
    license_class = models.CharField(max_length=20)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=LicenseStatus.choices,
        default=LicenseStatus.VALID,
    )
    issuing_authority = models.CharField(max_length=150, blank=True)
    restrictions = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["expiry_date", "license_number"]

    def __str__(self) -> str:
        return f"{self.license_number} - {self.driver.full_name}"

    @property
    def is_expired(self) -> bool:
        from django.utils import timezone

        return self.expiry_date < timezone.now().date()

    def clean(self):
        if self.expiry_date <= self.issue_date:
            raise ValidationError(
                {"expiry_date": "Expiry date must be later than issue date."}
            )
