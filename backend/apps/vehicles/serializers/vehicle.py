from rest_framework import serializers

from apps.vehicles.models import Vehicle, VehicleOwnership, VehicleType


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = [
            "id",
            "name",
            "code",
            "description",
            "default_capacity_tonnes",
            "axle_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VehicleOwnershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleOwnership
        fields = [
            "id",
            "name",
            "ownership_type",
            "contact_person",
            "phone_number",
            "email",
            "contract_reference",
            "effective_from",
            "effective_to",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VehicleReadSerializer(serializers.ModelSerializer):
    vehicle_type = VehicleTypeSerializer(read_only=True)
    ownership = VehicleOwnershipSerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "registration_number",
            "fleet_number",
            "vehicle_type",
            "ownership",
            "make",
            "model",
            "year",
            "chassis_number",
            "engine_number",
            "color",
            "capacity_tonnes",
            "status",
            "insurance_expiry",
            "inspection_expiry",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]


class VehicleWriteSerializer(serializers.ModelSerializer):
    vehicle_type_id = serializers.PrimaryKeyRelatedField(
        source="vehicle_type",
        queryset=VehicleType.objects.all(),
    )
    ownership_id = serializers.PrimaryKeyRelatedField(
        source="ownership",
        queryset=VehicleOwnership.objects.all(),
    )

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "registration_number",
            "fleet_number",
            "vehicle_type_id",
            "ownership_id",
            "make",
            "model",
            "year",
            "chassis_number",
            "engine_number",
            "color",
            "capacity_tonnes",
            "status",
            "insurance_expiry",
            "inspection_expiry",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        capacity = attrs.get("capacity_tonnes")
        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError(
                {"capacity_tonnes": "Capacity must be greater than zero."}
            )
        return attrs


class VehicleStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["status", "is_active", "notes"]
