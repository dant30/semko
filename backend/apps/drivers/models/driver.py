from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedModel


class Driver(TimeStampedModel):
    class EmploymentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On Leave"
        SUSPENDED = "suspended", "Suspended"
        INACTIVE = "inactive", "Inactive"
        TERMINATED = "terminated", "Terminated"

    employee_id = models.CharField(max_length=50, unique=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="driver_profile",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=30, unique=True)
    phone_number = models.CharField(max_length=20)
    alternate_phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    date_of_birth = models.DateField()
    hire_date = models.DateField()
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["first_name", "last_name", "employee_id"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.employee_id})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    def clean(self):
        today = timezone.now().date()
        if self.date_of_birth >= today:
            raise ValidationError(
                {"date_of_birth": "Date of birth must be in the past."}
            )
        if self.hire_date > today:
            raise ValidationError({"hire_date": "Hire date cannot be in the future."})
        if self.date_of_birth >= self.hire_date:
            raise ValidationError(
                {"hire_date": "Hire date must be later than date of birth."}
            )
