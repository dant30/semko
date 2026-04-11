# backend/apps/vehicles/services/availability.py
from datetime import timedelta

from django.utils import timezone

from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.constants import VehicleStatus


def get_available_vehicles(exclude_vehicle_id=None):
    """
    Return queryset of vehicles that are active and not under maintenance.
    Optionally exclude a specific vehicle (e.g., for editing).
    """
    qs = Vehicle.objects.filter(status=VehicleStatus.ACTIVE, is_active=True)
    if exclude_vehicle_id:
        qs = qs.exclude(pk=exclude_vehicle_id)
    return qs.select_related("vehicle_type", "ownership")


def get_vehicles_due_for_maintenance(days_ahead=7):
    """
    Returns vehicles where next_maintenance_due_date is within the next `days_ahead` days.
    """
    today = timezone.now().date()
    cutoff = today + timedelta(days=days_ahead)
    return Vehicle.objects.filter(
        next_maintenance_due_date__gte=today,
        next_maintenance_due_date__lte=cutoff,
        is_active=True,
        status__in=[VehicleStatus.ACTIVE, VehicleStatus.STANDBY],
    ).select_related("vehicle_type")


def get_vehicles_with_expiring_insurance(days_ahead=30):
    """
    Returns vehicles whose insurance expires within the next `days_ahead` days.
    """
    today = timezone.now().date()
    cutoff = today + timedelta(days=days_ahead)
    return Vehicle.objects.filter(
        ownership__isnull=False,
        ownership__insurance_expiry_date__gte=today,
        ownership__insurance_expiry_date__lte=cutoff,
        is_active=True,
    ).select_related("ownership")
