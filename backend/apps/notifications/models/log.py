from django.db import models

from apps.core.models import TimeStampedModel


class NotificationLog(TimeStampedModel):
    notification = models.ForeignKey(
        "notifications.Notification",
        on_delete=models.CASCADE,
        related_name="logs",
    )
    status = models.CharField(max_length=30, default="created")
    channel = models.CharField(max_length=30, default="in_app")
    detail = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.channel}:{self.status}"
