from apps.vehicles.models import Vehicle


def get_available_vehicles():
    return Vehicle.objects.filter(
        is_active=True,
        status=Vehicle.Status.ACTIVE,
    ).select_related("vehicle_type", "ownership")
