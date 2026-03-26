from django.db import models

from apps.core.models import TimeStampedModel


class DeductionRule(TimeStampedModel):
    class DeductionCategory(models.TextChoices):
        ADVANCE_RECOVERY = "advance_recovery", "Advance Recovery"
        DOCUMENT_NON_COMPLIANCE = "document_non_compliance", "Document Non Compliance"
        DISCIPLINARY = "disciplinary", "Disciplinary"
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
    deduction_category = models.CharField(
        max_length=40,
        choices=DeductionCategory.choices,
        default=DeductionCategory.OTHER,
    )
    calculation_method = models.CharField(
        max_length=20,
        choices=CalculationMethod.choices,
        default=CalculationMethod.FIXED,
    )
    apply_on = models.CharField(
        max_length=30,
        choices=ApplyOn.choices,
        default=ApplyOn.GROSS_POLICY,
    )
    rate_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_verified_trips = models.PositiveIntegerField(default=0)
    require_verified_documents = models.BooleanField(default=False)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    priority = models.PositiveIntegerField(default=100)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["priority", "name"]

    def __str__(self) -> str:
        return self.name
