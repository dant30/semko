# backend/apps/vehicles/signals.py
import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.audit.models import AuditLog
from apps.vehicles.models.vehicle import Vehicle

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Vehicle)
def capture_vehicle_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        instance._pre_save_data = {}
        return
    try:
        previous = sender.objects.get(pk=instance.pk)
        instance._pre_save_data = {
            "status": previous.status,
            "current_mileage_km": previous.current_mileage_km,
            "is_active": previous.is_active,
            "vehicle_type_id": previous.vehicle_type_id,
            "last_maintenance_date": previous.last_maintenance_date,
            "next_maintenance_due_date": previous.next_maintenance_due_date,
        }
    except sender.DoesNotExist:
        instance._pre_save_data = {}


@receiver(post_save, sender=Vehicle)
def log_vehicle_post_save(sender, instance, created, **kwargs):
    action = AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE
    metadata = {
        "vehicle_id": instance.pk,
        "registration_number": instance.registration_number,
    }
    old_data = getattr(instance, "_pre_save_data", {})
    changes = []
    if not created:
        for field in [
            "status", "current_mileage_km", "is_active",
            "vehicle_type_id", "last_maintenance_date", "next_maintenance_due_date",
        ]:
            old_val = old_data.get(field)
            new_val = getattr(instance, field)
            if old_val != new_val:
                changes.append({"field": field, "old": old_val, "new": new_val})
    if created or changes:
        if changes:
            metadata["changes"] = changes
        AuditLog.objects.create(
            actor=None,
            action=action,
            method="MODEL",
            path=f"/api/vehicles/{instance.pk}",
            status_code=200,
            metadata=metadata,
        )
        logger.info("Vehicle audit log recorded: %s", metadata)
