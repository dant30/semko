from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Notification(TimeStampedModel):
    class Channel(models.TextChoices):
        IN_APP = "in_app", "In App"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    class Category(models.TextChoices):
        PAYROLL = "payroll", "Payroll"
        TRIP = "trip", "Trip"
        STOCK = "stock", "Stock"
        OTHER = "other", "Other"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
        default=Channel.IN_APP,
    )
    event_code = models.CharField(max_length=100, blank=True)
    audience = models.CharField(max_length=50, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def status(self):
        if self.is_archived:
            return "archived"
        if self.is_read:
            return "read"
        return "unread"

    def __str__(self) -> str:
        return f"{self.title} -> {self.recipient}"
