from django.db import models

from apps.core.models import TimeStampedModel


class Payslip(TimeStampedModel):
    payroll_period = models.ForeignKey(
        "payroll.PayrollPeriod",
        on_delete=models.CASCADE,
        related_name="payslips",
    )
    driver = models.ForeignKey(
        "drivers.Driver",
        on_delete=models.PROTECT,
        related_name="payslips",
    )
    delivered_trip_count = models.PositiveIntegerField(default=0)
    verified_trip_count = models.PositiveIntegerField(default=0)
    gross_trip_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_bonus_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_non_trip_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_policy_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    trip_deduction_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    policy_deduction_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    statutory_deduction_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_trip_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_cess_reference = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_hired_owner_settlement = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    finalized_document = models.FileField(
        upload_to="payroll/finalized_payslips/",
        null=True,
        blank=True,
    )
    finalized_at = models.DateTimeField(null=True, blank=True)
    finalized_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="finalized_payslips",
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["payroll_period", "driver"],
                name="unique_payslip_per_driver_period",
            )
        ]

    def __str__(self) -> str:
        return f"{self.driver.full_name} - {self.payroll_period.name}"
