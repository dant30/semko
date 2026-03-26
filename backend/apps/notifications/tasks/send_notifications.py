from celery import shared_task

from apps.notifications.models import Notification, NotificationLog
from apps.notifications.services.email_service import send_email_notification
from apps.notifications.services.sms_service import send_sms_notification


def perform_notification_delivery(notification_id):
    notification = Notification.objects.select_related("recipient").filter(
        pk=notification_id
    ).first()
    if not notification:
        return {"status": "missing", "detail": "Notification not found."}

    if notification.channel == Notification.Channel.IN_APP:
        NotificationLog.objects.create(
            notification=notification,
            status="delivered",
            channel=notification.channel,
            detail="In-app notification already available.",
        )
        return {"status": "delivered", "detail": "In-app notification available."}

    try:
        if notification.channel == Notification.Channel.EMAIL:
            result = send_email_notification(
                recipient=notification.recipient,
                subject=notification.title,
                body=notification.message,
            )
        else:
            result = send_sms_notification(
                recipient=notification.recipient,
                message=notification.message,
            )
    except Exception as exc:
        result = {
            "status": "failed",
            "detail": str(exc),
        }

    NotificationLog.objects.create(
        notification=notification,
        status=result["status"],
        channel=notification.channel,
        detail=result["detail"],
    )
    return result


@shared_task
def deliver_notification_task(notification_id):
    return perform_notification_delivery(notification_id)


@shared_task
def deliver_pending_notifications_task(batch_size=100):
    pending = Notification.objects.filter(
        channel__in=[Notification.Channel.EMAIL, Notification.Channel.SMS]
    ).exclude(
        logs__status="delivered"
    ).distinct()[:batch_size]

    processed = 0
    for notification in pending:
        deliver_notification_task.delay(notification.id)
        processed += 1
    return {"queued": processed}
