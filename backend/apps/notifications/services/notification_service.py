from collections import defaultdict
from functools import partial

from django.conf import settings
from django.db import transaction

from apps.notifications.models import (
    Notification,
    NotificationLog,
    NotificationPreference,
    NotificationTemplate,
)
from apps.notifications.services.email_service import send_email_notification
from apps.notifications.services.sms_service import send_sms_notification
from apps.notifications.tasks.send_notifications import (
    deliver_notification_task,
    perform_notification_delivery,
)


def create_in_app_notification(*, recipient, title, message, category, metadata=None):
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        category=category,
        channel=Notification.Channel.IN_APP,
        metadata=metadata or {},
    )
    NotificationLog.objects.create(
        notification=notification,
        status="created",
        channel="in_app",
        detail="Notification created successfully.",
    )
    return notification


class _SafeFormatDict(defaultdict):
    def __missing__(self, key):
        return "{" + key + "}"


def _render_template(template_string, context):
    return template_string.format_map(_SafeFormatDict(str, context or {}))


def _resolve_audience(recipient):
    role = getattr(recipient, "role", None)
    role_code = getattr(role, "code", "").lower()
    role_name = getattr(role, "name", "").lower()
    if getattr(recipient, "driver_profile", None):
        return "driver"
    if "finance" in role_code or "finance" in role_name:
        return "finance"
    if role_code == "hr" or " hr" in role_name or role_name.startswith("hr") or "human resource" in role_name:
        return "hr"
    if "operation" in role_code or "operation" in role_name or "ops" in role_code:
        return "operations"
    if "payroll" in role_code or "payroll" in role_name:
        return "payroll"
    return "general"


def _default_channels_for_audience(audience):
    defaults = {
        "finance": [Notification.Channel.IN_APP, Notification.Channel.EMAIL],
        "hr": [Notification.Channel.IN_APP, Notification.Channel.EMAIL],
        "operations": [Notification.Channel.IN_APP],
        "payroll": [Notification.Channel.IN_APP, Notification.Channel.EMAIL],
        "driver": [Notification.Channel.IN_APP, Notification.Channel.SMS],
        "general": [Notification.Channel.IN_APP],
    }
    return defaults.get(audience, [Notification.Channel.IN_APP])


def _scoped_preferences(*, recipient, channel, event_code, category):
    user_preferences = NotificationPreference.objects.filter(
        user=recipient,
        channel=channel,
    )
    if event_code:
        scoped = user_preferences.filter(event_code=event_code)
        if scoped.exists():
            return scoped
    if category:
        scoped = user_preferences.filter(category=category)
        if scoped.exists():
            return scoped
    generic = user_preferences.filter(event_code="", category="")
    if generic.exists():
        return generic

    role = getattr(recipient, "role", None)
    if not role:
        return NotificationPreference.objects.none()
    role_preferences = NotificationPreference.objects.filter(
        role=role,
        channel=channel,
    )
    if event_code:
        scoped = role_preferences.filter(event_code=event_code)
        if scoped.exists():
            return scoped
    if category:
        scoped = role_preferences.filter(category=category)
        if scoped.exists():
            return scoped
    return role_preferences.filter(event_code="", category="")


def _is_channel_enabled(*, recipient, channel, event_code, category, audience):
    preferences = _scoped_preferences(
        recipient=recipient,
        channel=channel,
        event_code=event_code,
        category=category,
    )
    if preferences.exists():
        return any(item.is_enabled for item in preferences)
    return channel in _default_channels_for_audience(audience)


def _resolve_template(*, event_code, audience, channel):
    template = NotificationTemplate.objects.filter(
        event_code=event_code,
        audience=audience,
        channel=channel,
        is_active=True,
    ).first()
    if template:
        return template
    return NotificationTemplate.objects.filter(
        event_code=event_code,
        audience="general",
        channel=channel,
        is_active=True,
    ).first()


def _create_delivery_notification(*, recipient, title, message, category, channel, event_code, audience, metadata):
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        category=category,
        channel=channel,
        event_code=event_code,
        audience=audience,
        metadata=metadata or {},
    )
    NotificationLog.objects.create(
        notification=notification,
        status="created",
        channel=channel,
        detail="Notification created successfully.",
    )
    return notification


def _deliver_channel(*, notification, recipient, title, message, channel):
    if channel == Notification.Channel.IN_APP:
        NotificationLog.objects.create(
            notification=notification,
            status="delivered",
            channel=channel,
            detail="In-app notification available to recipient.",
        )
        return
    if channel == Notification.Channel.EMAIL:
        result = send_email_notification(recipient=recipient, subject=title, body=message)
    else:
        result = send_sms_notification(recipient=recipient, message=message)
    NotificationLog.objects.create(
        notification=notification,
        status=result["status"],
        channel=channel,
        detail=result["detail"],
    )


def _queue_delivery(notification):
    NotificationLog.objects.create(
        notification=notification,
        status="queued",
        channel=notification.channel,
        detail="Notification queued for background delivery.",
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        perform_notification_delivery(notification.id)
        return
    transaction.on_commit(
        partial(deliver_notification_task.delay, notification.id)
    )


def dispatch_notification_event(*, event_code, category, recipients, context=None, audience_overrides=None, fallback_title="", fallback_message=""):
    context = context or {}
    audience_overrides = audience_overrides or {}
    created_notifications = []

    for recipient in recipients:
        audience = audience_overrides.get(recipient.id) or _resolve_audience(recipient)
        for channel in Notification.Channel.values:
            if not _is_channel_enabled(
                recipient=recipient,
                channel=channel,
                event_code=event_code,
                category=category,
                audience=audience,
            ):
                continue
            template = _resolve_template(
                event_code=event_code,
                audience=audience,
                channel=channel,
            )
            title_template = getattr(template, "title_template", None) or fallback_title
            body_template = getattr(template, "body_template", None) or fallback_message
            title = _render_template(title_template, context)
            message = _render_template(body_template, context)
            notification = _create_delivery_notification(
                recipient=recipient,
                title=title,
                message=message,
                category=category,
                channel=channel,
                event_code=event_code,
                audience=audience,
                metadata=context,
            )
            if channel == Notification.Channel.IN_APP:
                _deliver_channel(
                    notification=notification,
                    recipient=recipient,
                    title=title,
                    message=message,
                    channel=channel,
                )
            else:
                _queue_delivery(notification)
            created_notifications.append(notification)
    return created_notifications
