from rest_framework import serializers

from apps.drivers.models import Driver
from apps.vehicles.models import Vehicle


def validate_trip_references(vehicle, driver):
    if vehicle.status != Vehicle.Status.ACTIVE or not vehicle.is_active:
        raise serializers.ValidationError(
            {"vehicle_id": "Trip vehicle must be active and available."}
        )
    if (
        driver.employment_status != Driver.EmploymentStatus.ACTIVE
        or not driver.is_active
    ):
        raise serializers.ValidationError(
            {"driver_id": "Trip driver must be active and available."}
        )
