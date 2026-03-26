from django.db import models

from apps.core.models import TimeStampedModel


class StatutoryRate(TimeStampedModel):
    class StatutoryType(models.TextChoices):
        PAYE = "paye", "PAYE"
        NSSF = "nssf", "NSSF"
        SHIF = "shif", "SHIF"
        HOUSING_LEVY = "housing_levy", "Housing Levy"
        OTHER = "other", "Other"

    class CalculationMethod(models.TextChoices):
        FIXED = "fixed", "Fixed Amount"
        PERCENTAGE = "percentage", "Percentage"

    class ApplyOn(models.TextChoices):
        GROSS_TRIP_REVENUE = "gross_trip_revenue", "Gross Trip Revenue"
        GROSS_BONUS = "gross_bonus", "Gross Bonus Earnings"
        GROSS_POLICY = "gross_policy", "Gross Policy Earnings"

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    statutory_type = models.CharField(
        max_length=30,
        choices=StatutoryType.choices,
        default=StatutoryType.OTHER,
    )
    calculation_method = models.CharField(
        max_length=20,
        choices=CalculationMethod.choices,
        default=CalculationMethod.PERCENTAGE,
    )
    apply_on = models.CharField(
        max_length=30,
        choices=ApplyOn.choices,
        default=ApplyOn.GROSS_POLICY,
    )
    rate_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    maximum_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name", "-effective_from"]

    def __str__(self) -> str:
        return self.name
