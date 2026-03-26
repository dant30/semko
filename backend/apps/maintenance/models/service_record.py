from django.db import models

from apps.core.models import TimeStampedModel


class ServiceRecord(TimeStampedModel):
    class ServiceStatus(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="service_records",
    )
    schedule = models.ForeignKey(
        "maintenance.MaintenanceSchedule",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="service_records",
    )
    mechanic = models.ForeignKey(
        "maintenance.Mechanic",
        on_delete=models.PROTECT,
        related_name="service_records",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    service_date = models.DateField()
    odometer_reading = models.DecimalField(max_digits=12, decimal_places=2)
    labor_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    external_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_parts_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=ServiceStatus.choices,
        default=ServiceStatus.OPEN,
    )
    diagnosis = models.TextField(blank=True)
    work_performed = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-service_date", "-created_at"]

    def __str__(self) -> str:
        return self.reference_no
