from django.db import models

from apps.core.models import TimeStampedModel


class CessReceipt(TimeStampedModel):
    transaction = models.OneToOneField(
        "cess.CessTransaction",
        on_delete=models.CASCADE,
        related_name="receipt",
    )
    receipt_number = models.CharField(max_length=100, unique=True)
    receipt_document = models.FileField(
        upload_to="cess_receipts/",
        null=True,
        blank=True,
    )
    payment_date = models.DateField()
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    verified = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-payment_date", "-created_at"]

    def __str__(self) -> str:
        return self.receipt_number
