from django.db import models

from apps.core.models import TimeStampedModel


class MaintenanceSchedule(TimeStampedModel):
    class MaintenanceType(models.TextChoices):
        PREVENTIVE = "preventive", "Preventive"
        CORRECTIVE = "corrective", "Corrective"
        INSPECTION = "inspection", "Inspection"
        TYRE = "tyre", "Tyre"
        ENGINE = "engine", "Engine"
        OTHER = "other", "Other"

    class ScheduleStatus(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        DUE = "due", "Due"
        OVERDUE = "overdue", "Overdue"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="maintenance_schedules",
    )
    reference_no = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    maintenance_type = models.CharField(max_length=20, choices=MaintenanceType.choices)
    interval_days = models.PositiveIntegerField(null=True, blank=True)
    interval_km = models.PositiveIntegerField(null=True, blank=True)
    last_service_date = models.DateField(null=True, blank=True)
    last_service_odometer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    next_due_date = models.DateField(null=True, blank=True)
    next_due_odometer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    current_odometer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=ScheduleStatus.choices,
        default=ScheduleStatus.SCHEDULED,
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["next_due_date", "vehicle__registration_number"]

    def __str__(self) -> str:
        return f"{self.reference_no} - {self.vehicle.registration_number}"
