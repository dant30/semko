from django.conf import settings
from django.core.mail import send_mail


def send_email_notification(*, recipient, subject, body):
    if not getattr(recipient, "email", ""):
        return {
            "status": "skipped",
            "detail": "Recipient does not have an email address.",
        }
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient.email],
        fail_silently=False,
    )
    return {
        "status": "delivered",
        "detail": f"Email delivered to {recipient.email}.",
    }
