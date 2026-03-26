from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class PayrollActionLog(TimeStampedModel):
    class Action(models.TextChoices):
        GENERATED = "generated", "Generated"
        APPROVED = "approved", "Approved"
        LOCKED = "locked", "Locked"
        FINALIZED = "finalized", "Finalized"

    payroll_period = models.ForeignKey(
        "payroll.PayrollPeriod",
        on_delete=models.CASCADE,
        related_name="action_logs",
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payroll_action_logs",
    )
    comment = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.payroll_period.name} - {self.action}"
