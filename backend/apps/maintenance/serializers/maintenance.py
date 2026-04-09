from decimal import Decimal

from rest_framework import serializers

from apps.maintenance.models import Mechanic, MaintenanceSchedule, PartUsed, ServiceRecord
from apps.maintenance.services.scheduling import (
    build_schedule_due_state,
    calculate_next_due_fields,
)
from apps.stores.models import Item
from apps.stores.services.stock_level import get_item_stock_on_hand
from apps.vehicles.models.vehicle import Vehicle


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "phone_number",
            "email",
            "specialization",
            "employment_type",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MechanicWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "phone_number",
            "email",
            "specialization",
            "employment_type",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )
    due_state = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceSchedule
        fields = [
            "id",
            "vehicle",
            "vehicle_registration",
            "reference_no",
            "title",
            "maintenance_type",
            "interval_days",
            "interval_km",
            "last_service_date",
            "last_service_odometer",
            "next_due_date",
            "next_due_odometer",
            "current_odometer",
            "status",
            "due_state",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "vehicle_registration", "due_state", "created_at", "updated_at"]

    def get_due_state(self, obj):
        return build_schedule_due_state(obj)


class MaintenanceScheduleWriteSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all())

    class Meta:
        model = MaintenanceSchedule
        fields = [
            "id",
            "vehicle_id",
            "reference_no",
            "title",
            "maintenance_type",
            "interval_days",
            "interval_km",
            "last_service_date",
            "last_service_odometer",
            "next_due_date",
            "next_due_odometer",
            "current_odometer",
            "status",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        interval_days = attrs.get("interval_days", getattr(self.instance, "interval_days", None))
        interval_km = attrs.get("interval_km", getattr(self.instance, "interval_km", None))
        if not interval_days and not interval_km:
            raise serializers.ValidationError(
                "At least one of interval_days or interval_km is required."
            )
        return attrs

    def create(self, validated_data):
        derived = calculate_next_due_fields(
            validated_data.get("last_service_date"),
            validated_data.get("last_service_odometer"),
            validated_data.get("interval_days"),
            validated_data.get("interval_km"),
        )
        for key, value in derived.items():
            validated_data[key] = validated_data.get(key) or value
        schedule = MaintenanceSchedule.objects.create(**validated_data)
        schedule.status = build_schedule_due_state(schedule)
        schedule.save(update_fields=["status", "updated_at"])
        return schedule

    def update(self, instance, validated_data):
        for key, value in calculate_next_due_fields(
            validated_data.get("last_service_date", instance.last_service_date),
            validated_data.get("last_service_odometer", instance.last_service_odometer),
            validated_data.get("interval_days", instance.interval_days),
            validated_data.get("interval_km", instance.interval_km),
        ).items():
            validated_data[key] = validated_data.get(key) or value
        schedule = super().update(instance, validated_data)
        schedule.status = build_schedule_due_state(schedule)
        schedule.save(update_fields=["status", "updated_at"])
        return schedule


class PartUsedSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = PartUsed
        fields = [
            "id",
            "service_record",
            "item",
            "item_name",
            "quantity",
            "unit_cost",
            "total_cost",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "item_name", "total_cost", "created_at", "updated_at"]


class PartUsedWriteSerializer(serializers.ModelSerializer):
    service_record_id = serializers.PrimaryKeyRelatedField(
        source="service_record",
        queryset=ServiceRecord.objects.all(),
    )
    item_id = serializers.PrimaryKeyRelatedField(source="item", queryset=Item.objects.all())

    class Meta:
        model = PartUsed
        fields = [
            "id",
            "service_record_id",
            "item_id",
            "quantity",
            "unit_cost",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        item = attrs.get("item", getattr(self.instance, "item", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be greater than zero."})
        if item and quantity is not None:
            available_stock = get_item_stock_on_hand(item)
            if self.instance and self.instance.is_active:
                available_stock += self.instance.quantity
            if quantity > available_stock:
                raise serializers.ValidationError(
                    {"quantity": "Part quantity exceeds available stores stock."}
                )
        return attrs

    def create(self, validated_data):
        validated_data["total_cost"] = Decimal(validated_data["quantity"]) * Decimal(
            validated_data["unit_cost"]
        )
        part = PartUsed.objects.create(**validated_data)
        _recalculate_service_costs(part.service_record)
        return part

    def update(self, instance, validated_data):
        if "quantity" in validated_data or "unit_cost" in validated_data:
            quantity = Decimal(validated_data.get("quantity", instance.quantity))
            unit_cost = Decimal(validated_data.get("unit_cost", instance.unit_cost))
            validated_data["total_cost"] = quantity * unit_cost
        part = super().update(instance, validated_data)
        _recalculate_service_costs(part.service_record)
        return part


class ServiceRecordSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )
    mechanic_name = serializers.CharField(source="mechanic.full_name", read_only=True)
    schedule_reference = serializers.CharField(source="schedule.reference_no", read_only=True)
    parts_used = PartUsedSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceRecord
        fields = [
            "id",
            "vehicle",
            "vehicle_registration",
            "schedule",
            "schedule_reference",
            "mechanic",
            "mechanic_name",
            "reference_no",
            "title",
            "service_date",
            "odometer_reading",
            "labor_cost",
            "external_cost",
            "total_parts_cost",
            "total_cost",
            "status",
            "diagnosis",
            "work_performed",
            "notes",
            "is_active",
            "parts_used",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "vehicle_registration",
            "schedule_reference",
            "mechanic_name",
            "total_parts_cost",
            "total_cost",
            "parts_used",
            "created_at",
            "updated_at",
        ]


class ServiceRecordWriteSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all())
    schedule_id = serializers.PrimaryKeyRelatedField(
        source="schedule",
        queryset=MaintenanceSchedule.objects.all(),
        required=False,
        allow_null=True,
    )
    mechanic_id = serializers.PrimaryKeyRelatedField(
        source="mechanic",
        queryset=Mechanic.objects.all(),
    )

    class Meta:
        model = ServiceRecord
        fields = [
            "id",
            "vehicle_id",
            "schedule_id",
            "mechanic_id",
            "reference_no",
            "title",
            "service_date",
            "odometer_reading",
            "labor_cost",
            "external_cost",
            "status",
            "diagnosis",
            "work_performed",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        vehicle = attrs.get("vehicle", getattr(self.instance, "vehicle", None))
        schedule = attrs.get("schedule", getattr(self.instance, "schedule", None))
        if schedule and vehicle and schedule.vehicle_id != vehicle.id:
            raise serializers.ValidationError(
                {"schedule_id": "Schedule must belong to the selected vehicle."}
            )
        return attrs

    def create(self, validated_data):
        record = ServiceRecord.objects.create(**validated_data)
        _recalculate_service_costs(record)
        _sync_schedule_from_service_record(record)
        return record

    def update(self, instance, validated_data):
        record = super().update(instance, validated_data)
        _recalculate_service_costs(record)
        _sync_schedule_from_service_record(record)
        return record


def _recalculate_service_costs(service_record):
    parts_total = sum(
        (part.total_cost for part in service_record.parts_used.filter(is_active=True)),
        Decimal("0.00"),
    )
    service_record.total_parts_cost = parts_total
    service_record.total_cost = (
        Decimal(service_record.labor_cost)
        + Decimal(service_record.external_cost)
        + Decimal(parts_total)
    )
    service_record.save(update_fields=["total_parts_cost", "total_cost", "updated_at"])


def _sync_schedule_from_service_record(service_record):
    schedule = service_record.schedule
    if not schedule or service_record.status != ServiceRecord.ServiceStatus.COMPLETED:
        return
    schedule.last_service_date = service_record.service_date
    schedule.last_service_odometer = service_record.odometer_reading
    schedule.current_odometer = service_record.odometer_reading
    derived = calculate_next_due_fields(
        schedule.last_service_date,
        schedule.last_service_odometer,
        schedule.interval_days,
        schedule.interval_km,
    )
    schedule.next_due_date = derived["next_due_date"]
    schedule.next_due_odometer = derived["next_due_odometer"]
    schedule.status = MaintenanceSchedule.ScheduleStatus.COMPLETED
    schedule.save(
        update_fields=[
            "last_service_date",
            "last_service_odometer",
            "current_odometer",
            "next_due_date",
            "next_due_odometer",
            "status",
            "updated_at",
        ]
    )
