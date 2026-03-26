from django.db import models

from apps.core.models import TimeStampedModel


class Mechanic(TimeStampedModel):
    class EmploymentType(models.TextChoices):
        INTERNAL = "internal", "Internal"
        EXTERNAL = "external", "External"
        CONTRACT = "contract", "Contract"

    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    specialization = models.CharField(max_length=150, blank=True)
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.INTERNAL,
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["first_name", "last_name", "employee_id"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.employee_id})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
