from django.db import models

from apps.core.models import TimeStampedModel


class Trip(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        IN_PROGRESS = "in_progress", "In Progress"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class TripType(models.TextChoices):
        OWNED = "owned", "Owned Fleet"
        HIRED = "hired", "Hired Fleet"

    trip_number = models.CharField(max_length=50, unique=True)
    delivery_note_number = models.CharField(max_length=100, unique=True)
    delivery_note_document = models.FileField(
        upload_to="delivery_notes/",
        null=True,
        blank=True,
    )
    trip_date = models.DateField()
    dispatch_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)
    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="trips",
    )
    driver = models.ForeignKey(
        "drivers.Driver",
        on_delete=models.PROTECT,
        related_name="trips",
    )
    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.PROTECT,
        related_name="trips",
    )
    quarry = models.ForeignKey(
        "clients.Quarry",
        on_delete=models.PROTECT,
        related_name="trips",
    )
    material = models.ForeignKey(
        "materials.Material",
        on_delete=models.PROTECT,
        related_name="trips",
    )
    destination = models.CharField(max_length=200)
    classification_label = models.CharField(max_length=100, blank=True)
    trip_type = models.CharField(
        max_length=20,
        choices=TripType.choices,
        default=TripType.OWNED,
    )
    quantity_unit = models.CharField(max_length=20, blank=True)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    agreed_unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    remarks = models.TextField(blank=True)
    documents_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-trip_date", "-created_at"]

    def __str__(self) -> str:
        return self.trip_number
