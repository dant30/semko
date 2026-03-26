from django.db import models

from apps.core.models import TimeStampedModel


class CessTransaction(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ASSESSED = "assessed", "Assessed"
        PAID = "paid", "Paid"
        VERIFIED = "verified", "Verified"

    trip = models.OneToOneField(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="cess_transaction",
    )
    cess_rate = models.ForeignKey(
        "cess.CessRate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    county = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Cess - {self.trip.trip_number}"
