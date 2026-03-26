from django.db import models

from apps.core.models import TimeStampedModel


class NotificationTemplate(TimeStampedModel):
    event_code = models.CharField(max_length=100)
    audience = models.CharField(max_length=50, default="general")
    channel = models.CharField(
        max_length=20,
        choices=[
            ("in_app", "In App"),
            ("email", "Email"),
            ("sms", "SMS"),
        ],
    )
    title_template = models.CharField(max_length=200)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["event_code", "audience", "channel"]
        constraints = [
            models.UniqueConstraint(
                fields=["event_code", "audience", "channel"],
                name="unique_notification_template_scope",
            )
        ]

    def __str__(self) -> str:
        return f"{self.event_code} [{self.audience}/{self.channel}]"
