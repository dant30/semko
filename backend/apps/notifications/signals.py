"""
Signal handlers for notifications.

Triggered when business events occur across the system:
- Trip events (created, completed, delayed)
- Stock events (low stock, purchase order received)
- User events (account created, role changed)
- Payroll events (payroll processed, payment approved)

Follows Django patterns with post_save and post_delete signals.
"""
from datetime import datetime, date
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils.timezone import now
from django.contrib.auth import get_user_model

from apps.notifications.services.notification_service import dispatch_notification_event
from apps.notifications.models import Notification

User = get_user_model()


def _serialize_context(context):
    """Convert non-JSON-serializable objects to strings in context dict."""
    if not context:
        return context
    
    serialized = {}
    for key, value in context.items():
        if isinstance(value, (datetime, date)):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized


def _get_users_by_role_codes(role_codes):
    """Get all users with the specified role codes."""
    if not role_codes:
        return User.objects.none()
    return User.objects.filter(role__code__in=role_codes).distinct()


# ============================================================================
# TRIP EVENTS
# ============================================================================

@receiver(post_save, sender='trips.Trip')
def notify_trip_created(sender, instance, created, **kwargs):
    """Notify relevant users when a new trip is created."""
    if created and instance.status == 'scheduled':
        recipients = _get_users_by_role_codes(['operations', 'driver'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='trip.created',
                category=Notification.Category.TRIP,
                recipients=list(recipients),
                context=_serialize_context({
                    'trip_number': instance.reference_no or f'Trip {instance.id}',
                    'origin': getattr(instance, 'origin', 'Unknown'),
                    'destination': getattr(instance, 'destination', 'Unknown'),
                    'departure_date': instance.scheduled_departure,
                    'assigned_driver': getattr(instance.driver, 'name', 'Unassigned'),
                })
            )


@receiver(post_save, sender='trips.Trip')
def notify_trip_completed(sender, instance, created, update_fields, **kwargs):
    """Notify when trip status changes to completed."""
    if not created and instance.status == 'completed':
        recipients = _get_users_by_role_codes(['operations', 'reports'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='trip.completed',
                category=Notification.Category.TRIP,
                recipients=list(recipients),
                context=_serialize_context({
                    'trip_number': instance.reference_no or f'Trip {instance.id}',
                    'completed_at': now(),
                    'duration_days': (now() - instance.created_at).days,
                })
            )


@receiver(post_save, sender='trips.Trip')
def notify_trip_delayed(sender, instance, created, update_fields, **kwargs):
    """Notify operations when trip status changes to delayed."""
    if not created and instance.status == 'delayed':
        recipients = _get_users_by_role_codes(['operations', 'management'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='trip.delayed',
                category=Notification.Category.TRIP,
                recipients=list(recipients),
                context=_serialize_context({
                    'trip_number': instance.reference_no or f'Trip {instance.id}',
                    'delay_reason': getattr(instance, 'delay_reason', 'Not specified'),
                })
            )


# ============================================================================
# STOCK/INVENTORY EVENTS
# ============================================================================

# NOTE: the stores app models are named Item and StockReceiving, not StoreItem/GoodsReceipt.
@receiver(post_save, sender='stores.Item')
def notify_low_stock(sender, instance, created, update_fields, **kwargs):
    """Notify stores team when stock falls below reorder level."""
    stock_on_hand = getattr(instance, 'stock_on_hand', None)
    if stock_on_hand is None:
        stock_on_hand = (
            instance.__class__.objects.with_stock_snapshot()
            .filter(pk=instance.pk)
            .values_list('stock_on_hand', flat=True)
            .first()
        )

    if (
        not created
        and stock_on_hand is not None
        and getattr(instance, 'reorder_level', None) is not None
        and stock_on_hand <= instance.reorder_level
    ):
        recipients = _get_users_by_role_codes(['stores', 'procurement'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='stock.below_reorder',
                category=Notification.Category.STOCK,
                recipients=list(recipients),
                context=_serialize_context({
                    'item_name': instance.name or instance.code,
                    'current_quantity': stock_on_hand,
                    'reorder_level': instance.reorder_level,
                    'reorder_quantity': getattr(instance, 'standard_issue_quantity', 0) or 0,
                })
            )


@receiver(post_save, sender='stores.PurchaseOrder')
def notify_purchase_order_approved(sender, instance, created, update_fields, **kwargs):
    """Notify when purchase order is approved."""
    if not created and instance.status == 'approved':
        recipients = _get_users_by_role_codes(['procurement', 'stores'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='purchase_order.approved',
                category=Notification.Category.STOCK,
                recipients=list(recipients),
                context=_serialize_context({
                    'po_number': instance.reference_no or f'PO {instance.id}',
                    'supplier': getattr(instance.supplier, 'name', 'Unknown'),
                    'total_amount': instance.total_amount,
                    'approval_date': now(),
                })
            )


@receiver(post_save, sender='stores.StockReceiving')
def notify_goods_received(sender, instance, created, **kwargs):
    """Notify stores team when goods are received against purchase order."""
    if created:
        recipients = _get_users_by_role_codes(['stores', 'procurement'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='goods.received',
                category=Notification.Category.STOCK,
                recipients=list(recipients),
                context=_serialize_context({
                    'receipt_number': instance.reference_no or f'Receipt {instance.id}',
                    'purchase_order': getattr(instance.purchase_order, 'reference_no', 'Unknown'),
                    'item_count': 1,
                    'received_date': instance.received_date,
                })
            )


# ============================================================================
# USER/ACCOUNT EVENTS
# ============================================================================

@receiver(post_save, sender='users.User')
def notify_user_created(sender, instance, created, **kwargs):
    """Notify HR/Admin when new user account is created."""
    if created:
        recipients = _get_users_by_role_codes(['hr', 'admin'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='user.created',
                category=Notification.Category.OTHER,
                recipients=list(recipients),
                context=_serialize_context({
                    'user_name': instance.get_full_name() or instance.username,
                    'email': instance.email,
                    'role': getattr(instance.role, 'name', 'Not assigned'),
                    'created_date': now(),
                })
            )


@receiver(post_save, sender='users.User')
def notify_user_role_changed(sender, instance, created, update_fields, **kwargs):
    """Notify when user role is changed."""
    if not created and update_fields and 'role' in update_fields:
        recipients = _get_users_by_role_codes(['admin', 'hr'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='user.role_changed',
                category=Notification.Category.OTHER,
                recipients=list(recipients),
                context=_serialize_context({
                    'user_name': instance.get_full_name() or instance.username,
                    'new_role': getattr(instance.role, 'name', 'Not assigned'),
                    'changed_date': now(),
                })
            )


# ============================================================================
# PAYROLL EVENTS
# ============================================================================

@receiver(post_save, sender='payroll.Payslip')
def notify_payslip_ready(sender, instance, created, update_fields, **kwargs):
    """Notify employee when payslip is generated and ready."""
    if not created and instance.status == 'approved':
        # Send to the employee user if they have one
        employee_user = getattr(instance.employee, 'user', None) if hasattr(instance.employee, 'user') else None
        if employee_user:
            recipients = [employee_user]
        else:
            recipients = _get_users_by_role_codes(['payroll'])
        
        if recipients:
            dispatch_notification_event(
                event_code='payslip.ready',
                category=Notification.Category.PAYROLL,
                recipients=recipients if isinstance(recipients, list) else list(recipients),
                context=_serialize_context({
                    'employee_name': getattr(instance.employee, 'name', 'Employee'),
                    'payslip_period': str(instance.payroll_period) if hasattr(instance, 'payroll_period') else 'Current',
                    'ready_date': now(),
                })
            )


@receiver(post_save, sender='payroll.PayrollPeriod')
def notify_payroll_processed(sender, instance, created, **kwargs):
    """Notify HR/Finance when payroll period is processed."""
    if not created and getattr(instance, 'status', None) in ('completed', 'approved'):
        payroll_period_name = getattr(instance, 'name', None) or str(instance)
        payslip_count = 0
        try:
            from apps.payroll.models import Payslip

            payslip_count = Payslip.objects.filter(payroll_period=instance).count()
        except Exception:
            payslip_count = 0

        recipients = _get_users_by_role_codes(['hr', 'finance'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='payroll.processed',
                category=Notification.Category.PAYROLL,
                recipients=list(recipients),
                context=_serialize_context({
                    'payroll_period': payroll_period_name,
                    'employee_count': payslip_count,
                    'total_amount': getattr(instance, 'total_amount', 0) or 0,
                    'processed_date': now(),
                })
            )


# ============================================================================
# MAINTENANCE EVENTS
# ============================================================================

@receiver(post_save, sender='maintenance.MaintenanceSchedule')
def notify_maintenance_due(sender, instance, created, update_fields, **kwargs):
    """Notify workshop when vehicle maintenance is due."""
    if not created and instance.status == 'due':
        recipients = _get_users_by_role_codes(['maintenance', 'operations'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='maintenance.due',
                category=Notification.Category.OTHER,
                recipients=list(recipients),
                context=_serialize_context({
                    'vehicle': getattr(instance.vehicle, 'name', 'Unknown Vehicle'),
                    'maintenance_type': instance.service_type if hasattr(instance, 'service_type') else 'Maintenance',
                    'due_date': instance.due_date if hasattr(instance, 'due_date') else None,
                })
            )


@receiver(post_save, sender='maintenance.ServiceRecord')
def notify_service_completed(sender, instance, created, **kwargs):
    """Notify operations when vehicle service is completed."""
    if created:
        recipients = _get_users_by_role_codes(['operations', 'fleet'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='service.completed',
                category=Notification.Category.OTHER,
                recipients=list(recipients),
                context=_serialize_context({
                    'vehicle': getattr(instance.vehicle, 'name', 'Unknown Vehicle'),
                    'service_date': now(),
                    'mechanic': getattr(instance.mechanic, 'name', 'Technician') if hasattr(instance, 'mechanic') else 'Technician',
                })
            )


# ============================================================================
# FUEL EVENTS
# ============================================================================

@receiver(post_save, sender='fuel.FuelTransaction')
def notify_unusual_fuel_consumption(sender, instance, created, **kwargs):
    """Notify fleet when unusual fuel consumption is detected."""
    if created:
        # Check if consumption is outside normal range (this would be custom logic)
        consumption_rate = getattr(instance, 'consumption_rate', None)
        if consumption_rate and consumption_rate > 15:  # Example threshold
            recipients = _get_users_by_role_codes(['fleet', 'operations'])
            if recipients.exists():
                dispatch_notification_event(
                    event_code='fuel.high_consumption',
                    category=Notification.Category.OTHER,
                    recipients=list(recipients),
                    context=_serialize_context({
                        'vehicle': getattr(instance.vehicle, 'name', 'Unknown Vehicle'),
                        'consumption_rate': consumption_rate,
                        'transaction_date': now(),
                    })
                )


# ============================================================================
# AUDIT/COMPLIANCE EVENTS
# ============================================================================

@receiver(post_save, sender='audit.AuditLog')
def notify_critical_audit_event(sender, instance, created, **kwargs):
    """Notify management of critical audit events."""
    if created and instance.action in ['delete', 'bulk_update', 'permission_change']:
        recipients = _get_users_by_role_codes(['admin', 'management'])
        if recipients.exists():
            dispatch_notification_event(
                event_code='audit.critical_action',
                category=Notification.Category.OTHER,
                recipients=list(recipients),
                context=_serialize_context({
                    'action': instance.action,
                    'user': getattr(instance.user, 'get_full_name', lambda: 'Unknown')(),
                    'resource': instance.resource_type if hasattr(instance, 'resource_type') else 'Unknown',
                    'timestamp': instance.timestamp if hasattr(instance, 'timestamp') else now(),
                })
            )


# Note: Signal receivers are auto-registered in apps.py ready() method
