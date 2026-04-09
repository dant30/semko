from rest_framework import serializers

from apps.drivers.models import Driver
from apps.fuel.calculators.efficiency import calculate_efficiency_metrics
from apps.fuel.models import FuelConsumption, FuelStation, FuelTransaction
from apps.trips.models import Trip
from apps.vehicles.models.vehicle import Vehicle


class FuelStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelStation
        fields = [
            "id",
            "name",
            "code",
            "station_type",
            "location",
            "contact_person",
            "contact_phone",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FuelStationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelStation
        fields = [
            "id",
            "name",
            "code",
            "station_type",
            "location",
            "contact_person",
            "contact_phone",
            "is_active",
        ]
        read_only_fields = ["id"]


class FuelTransactionSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )
    driver_name = serializers.CharField(source="driver.full_name", read_only=True)
    station_name = serializers.CharField(source="station.name", read_only=True)
    trip_number = serializers.CharField(source="trip.trip_number", read_only=True)

    class Meta:
        model = FuelTransaction
        fields = [
            "id",
            "reference_no",
            "transaction_date",
            "vehicle",
            "vehicle_registration",
            "driver",
            "driver_name",
            "trip",
            "trip_number",
            "station",
            "station_name",
            "fuel_type",
            "litres",
            "unit_price",
            "total_cost",
            "odometer_reading",
            "full_tank",
            "payment_method",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "total_cost",
            "vehicle_registration",
            "driver_name",
            "trip_number",
            "station_name",
            "created_at",
            "updated_at",
        ]


class FuelTransactionWriteSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all())
    driver_id = serializers.PrimaryKeyRelatedField(
        source="driver",
        queryset=Driver.objects.all(),
        required=False,
        allow_null=True,
    )
    trip_id = serializers.PrimaryKeyRelatedField(
        source="trip",
        queryset=Trip.objects.all(),
        required=False,
        allow_null=True,
    )
    station_id = serializers.PrimaryKeyRelatedField(
        source="station",
        queryset=FuelStation.objects.all(),
    )

    class Meta:
        model = FuelTransaction
        fields = [
            "id",
            "reference_no",
            "transaction_date",
            "vehicle_id",
            "driver_id",
            "trip_id",
            "station_id",
            "fuel_type",
            "litres",
            "unit_price",
            "odometer_reading",
            "full_tank",
            "payment_method",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        vehicle = attrs.get("vehicle", getattr(self.instance, "vehicle", None))
        trip = attrs.get("trip", getattr(self.instance, "trip", None))
        driver = attrs.get("driver", getattr(self.instance, "driver", None))
        if trip and vehicle and trip.vehicle_id != vehicle.id:
            raise serializers.ValidationError(
                {"trip_id": "Selected trip must belong to the same vehicle."}
            )
        if trip and driver and trip.driver_id != driver.id:
            raise serializers.ValidationError(
                {"driver_id": "Selected trip must belong to the same driver."}
            )
        return attrs


class FuelConsumptionSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    class Meta:
        model = FuelConsumption
        fields = [
            "id",
            "vehicle",
            "vehicle_registration",
            "period_start",
            "period_end",
            "opening_odometer",
            "closing_odometer",
            "total_litres",
            "total_cost",
            "distance_covered",
            "km_per_litre",
            "litres_per_100km",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "vehicle_registration",
            "distance_covered",
            "km_per_litre",
            "litres_per_100km",
            "total_cost",
            "created_at",
            "updated_at",
        ]


class FuelConsumptionWriteSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all())

    class Meta:
        model = FuelConsumption
        fields = [
            "id",
            "vehicle_id",
            "period_start",
            "period_end",
            "opening_odometer",
            "closing_odometer",
            "total_litres",
            "total_cost",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        metrics = calculate_efficiency_metrics(
            validated_data["opening_odometer"],
            validated_data["closing_odometer"],
            validated_data["total_litres"],
            validated_data["total_cost"],
        )
        validated_data.update(metrics)
        return FuelConsumption.objects.create(**validated_data)

    def update(self, instance, validated_data):
        consumption = super().update(instance, validated_data)
        metrics = calculate_efficiency_metrics(
            consumption.opening_odometer,
            consumption.closing_odometer,
            consumption.total_litres,
            consumption.total_cost,
        )
        for field, value in metrics.items():
            setattr(consumption, field, value)
        consumption.save(
            update_fields=[
                "distance_covered",
                "km_per_litre",
                "litres_per_100km",
                "total_cost",
                "updated_at",
            ]
        )
        return consumption
