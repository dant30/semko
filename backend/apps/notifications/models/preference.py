from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class NotificationPreference(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notification_preferences",
    )
    role = models.ForeignKey(
        "users.Role",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notification_preferences",
    )
    channel = models.CharField(
        max_length=20,
        choices=[
            ("in_app", "In App"),
            ("email", "Email"),
            ("sms", "SMS"),
        ],
    )
    category = models.CharField(max_length=30, blank=True)
    event_code = models.CharField(max_length=100, blank=True)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        ordering = ["channel", "category", "event_code"]

    def __str__(self) -> str:
        target = self.user.username if self.user else getattr(self.role, "name", "unscoped")
        return f"{target} - {self.channel}"
