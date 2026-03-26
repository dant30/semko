from celery import shared_task

from apps.notifications.tasks.send_notifications import deliver_pending_notifications_task


@shared_task
def process_notification_queue():
    return deliver_pending_notifications_task()
