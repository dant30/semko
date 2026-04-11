# backend/apps/vehicles/serializers/vehicle.py
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.vehicles.constants import FuelType, OwnershipType, VehicleStatus
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.vehicle_type import VehicleType
from apps.vehicles.models.ownership import VehicleOwnership


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = [
            "id", "name", "code", "description", "max_load_tonnes",
            "max_volume_cubic_meters", "typical_fuel_consumption_l_per_100km",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VehicleOwnershipSerializer(serializers.ModelSerializer):
    ownership_type_display = serializers.CharField(source="get_ownership_type_display", read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(
        source="vehicle",
        queryset=Vehicle.objects.all(),
        write_only=True,
        required=True,
    )
    vehicle = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = VehicleOwnership
        fields = [
            "id", "vehicle", "vehicle_id", "ownership_type", "ownership_type_display", "owner_name",
            "lease_start_date", "lease_end_date", "monthly_lease_cost",
            "registration_document_number", "insurance_provider",
            "insurance_policy_number", "insurance_expiry_date", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "vehicle", "created_at", "updated_at"]

    def validate(self, attrs):
        if self.instance is None:
            vehicle = attrs.get("vehicle")
            if vehicle and VehicleOwnership.objects.filter(vehicle=vehicle).exists():
                raise serializers.ValidationError(
                    {"vehicle_id": "This vehicle already has an ownership record."}
                )

        ownership_type = attrs.get("ownership_type")
        lease_start = attrs.get("lease_start_date")
        lease_end = attrs.get("lease_end_date")
        monthly_cost = attrs.get("monthly_lease_cost")

        if self.instance is not None:
            ownership_type = ownership_type or self.instance.ownership_type
            lease_start = lease_start or self.instance.lease_start_date
            lease_end = lease_end or self.instance.lease_end_date
            monthly_cost = monthly_cost if "monthly_lease_cost" in attrs else self.instance.monthly_lease_cost

        if lease_start and lease_end and lease_end <= lease_start:
            raise serializers.ValidationError(
                {"lease_end_date": "Lease end date must be after lease start date."}
            )

        if ownership_type in {OwnershipType.LEASED, OwnershipType.CONTRACT_HIRE} and monthly_cost is None:
            raise serializers.ValidationError(
                {"monthly_lease_cost": "Monthly lease cost is required for leased or contract hire vehicles."}
            )

        if ownership_type == OwnershipType.COMPANY_OWNED and monthly_cost is not None:
            raise serializers.ValidationError(
                {"monthly_lease_cost": "Company owned vehicles should not have a monthly lease cost."}
            )

        return attrs


class VehicleReadSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    fuel_type_display = serializers.CharField(source="get_fuel_type_display", read_only=True)
    vehicle_type_detail = VehicleTypeSerializer(source="vehicle_type", read_only=True)
    ownership = VehicleOwnershipSerializer(read_only=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id", "registration_number", "vin", "make", "model", "year",
            "fuel_type", "fuel_type_display", "status", "status_display",
            "vehicle_type", "vehicle_type_detail", "current_mileage_km",
            "seating_capacity", "load_capacity_tonnes", "color", "engine_number",
            "last_maintenance_date", "next_maintenance_due_km",
            "next_maintenance_due_date", "notes", "is_active", "is_available",
            "ownership", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_available", "created_at", "updated_at"]


class VehicleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "registration_number", "vin", "make", "model", "year",
            "fuel_type", "status", "vehicle_type", "current_mileage_km",
            "seating_capacity", "load_capacity_tonnes", "color", "engine_number",
            "last_maintenance_date", "next_maintenance_due_km",
            "next_maintenance_due_date", "notes", "is_active",
        ]

    def validate(self, attrs):
        vehicle = self.instance or Vehicle()
        for field, value in attrs.items():
            setattr(vehicle, field, value)
        try:
            vehicle.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)
        return attrs


class VehicleWithOwnershipCreateSerializer(serializers.ModelSerializer):
    ownership = VehicleOwnershipSerializer(write_only=True, required=False)

    class Meta:
        model = Vehicle
        fields = [
            "registration_number", "vin", "make", "model", "year",
            "fuel_type", "status", "vehicle_type", "current_mileage_km",
            "seating_capacity", "load_capacity_tonnes", "color", "engine_number",
            "last_maintenance_date", "next_maintenance_due_km",
            "next_maintenance_due_date", "notes", "is_active", "ownership",
        ]

    def validate(self, attrs):
        vehicle_attrs = {k: v for k, v in attrs.items() if k != "ownership"}
        vehicle = self.instance or Vehicle()
        for field, value in vehicle_attrs.items():
            setattr(vehicle, field, value)
        try:
            vehicle.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)
        return attrs

    def create(self, validated_data):
        ownership_data = validated_data.pop("ownership", None)
        vehicle = Vehicle.objects.create(**validated_data)
        if ownership_data:
            VehicleOwnership.objects.create(vehicle=vehicle, **ownership_data)
        return vehicle


class VehicleOwnershipWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleOwnership
        fields = [
            "ownership_type", "owner_name", "lease_start_date", "lease_end_date",
            "monthly_lease_cost", "registration_document_number",
            "insurance_provider", "insurance_policy_number", "insurance_expiry_date",
            "notes",
        ]
