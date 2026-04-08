"""
Celery tasks for the users app.

Handles asynchronous operations like sending password reset emails.
"""

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id, user_email, reset_link):
    """
    Send password reset email asynchronously via Celery.
    
    Args:
        user_id: Django user ID (for logging/tracking)
        user_email: Recipient email address
        reset_link: Full password reset link to include in email
    
    Retries up to 3 times on failure with exponential backoff.
    """
    try:
        send_mail(
            subject="Password reset request",
            message=f"To reset your password, click the link: {reset_link}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@semko.local'),
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to user {user_id}")
    except Exception as exc:
        logger.error(
            f"Failed to send password reset email to user {user_id}: {str(exc)}"
        )
        # Retry with exponential backoff: 60s, 300s, 900s
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True)
def send_user_welcome_email(self, user_id, user_email, username):
    """
    Send welcome email to newly registered users.
    
    Args:
        user_id: Django user ID
        user_email: Recipient email address
        username: New user's username
    """
    try:
        send_mail(
            subject="Welcome to Semko",
            message=f"Welcome {username}! Your account has been created successfully.",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@semko.local'),
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info(f"Welcome email sent to user {user_id}")
    except Exception as exc:
        logger.error(
            f"Failed to send welcome email to user {user_id}: {str(exc)}"
        )
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
