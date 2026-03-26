from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import TimeStampedModel


class FuelTransaction(TimeStampedModel):
    class FuelType(models.TextChoices):
        DIESEL = "diesel", "Diesel"
        PETROL = "petrol", "Petrol"
        KEROSENE = "kerosene", "Kerosene"
        OTHER = "other", "Other"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        CREDIT = "credit", "Credit"
        FUEL_CARD = "fuel_card", "Fuel Card"
        VOUCHER = "voucher", "Voucher"
        INTERNAL = "internal", "Internal"

    reference_no = models.CharField(max_length=50, unique=True)
    transaction_date = models.DateField()
    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="fuel_transactions",
    )
    driver = models.ForeignKey(
        "drivers.Driver",
        on_delete=models.PROTECT,
        related_name="fuel_transactions",
        null=True,
        blank=True,
    )
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.SET_NULL,
        related_name="fuel_transactions",
        null=True,
        blank=True,
    )
    station = models.ForeignKey(
        "fuel.FuelStation",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    fuel_type = models.CharField(max_length=20, choices=FuelType.choices)
    litres = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    odometer_reading = models.DecimalField(max_digits=12, decimal_places=2)
    full_tank = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-transaction_date", "-created_at"]

    def __str__(self) -> str:
        return self.reference_no

    def clean(self):
        if self.litres <= 0:
            raise ValidationError({"litres": "Litres must be greater than zero."})
        if self.unit_price <= 0:
            raise ValidationError({"unit_price": "Unit price must be greater than zero."})
        if self.odometer_reading < 0:
            raise ValidationError(
                {"odometer_reading": "Odometer reading cannot be negative."}
            )
        if self.trip and self.trip.vehicle_id != self.vehicle_id:
            raise ValidationError({"trip": "Selected trip must belong to the same vehicle."})

    def save(self, *args, **kwargs):
        self.total_cost = Decimal(self.litres) * Decimal(self.unit_price)
        super().save(*args, **kwargs)
