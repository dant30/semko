# backend/apps/users/signals.py
import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.audit.models import AuditLog
from apps.users.models import User

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=User)
def capture_user_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        instance._pre_save_data = {}
        return

    try:
        previous = sender.objects.get(pk=instance.pk)
        instance._pre_save_data = {
            "username": previous.username,
            "email": previous.email,
            "first_name": previous.first_name,
            "last_name": previous.last_name,
            "phone_number": previous.phone_number,
            "role_id": previous.role_id,
            "is_active": previous.is_active,
            "is_staff": previous.is_staff,
            "must_change_password": previous.must_change_password,
        }
    except sender.DoesNotExist:
        instance._pre_save_data = {}


@receiver(post_save, sender=User)
def log_user_post_save(sender, instance, created, **kwargs):
    action = AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE
    metadata = {
        "user_id": instance.pk,
        "username": instance.username,
    }

    old_data = getattr(instance, "_pre_save_data", {})
    changes = []

    if not created:
        for field in [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role_id",
            "is_active",
            "is_staff",
            "must_change_password",
        ]:
            old_value = old_data.get(field)
            new_value = getattr(instance, field)
            if field == "role_id":
                old_value = old_data.get("role_id")
                new_value = instance.role_id

            if old_value != new_value:
                changes.append({"field": field, "old": old_value, "new": new_value})

    if created or changes:
        if changes:
            metadata["changes"] = changes

        AuditLog.objects.create(
            actor=None,
            action=action,
            method="MODEL",
            path=f"/api/users/{instance.pk}",
            status_code=200,
            metadata=metadata,
        )
        logger.info("User audit log recorded: %s", metadata)
