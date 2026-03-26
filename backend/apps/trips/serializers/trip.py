import os
from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from apps.clients.models import Client, Quarry
from apps.cess.calculators.cess_calculator import calculate_cess_amount
from apps.cess.models import CessReceipt, CessTransaction
from apps.cess.serializers import (
    CessReceiptSerializer,
    CessTransactionSerializer,
    CessTransactionWriteSerializer,
)
from apps.cess.services import resolve_applicable_cess_rate
from apps.drivers.models import Driver
from apps.materials.models import Material
from apps.rules.services import evaluate_trip_rules
from apps.trips.calculators.penalty import calculate_discrepancy, calculate_penalty
from apps.trips.models import Discrepancy, HiredTrip, Trip, WeighbridgeReading
from apps.trips.serializers.weighbridge import WeighbridgeReadingSerializer
from apps.trips.services.trip_validation import validate_trip_references
from apps.vehicles.models import Vehicle


class DiscrepancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Discrepancy
        fields = [
            "id",
            "weight_difference",
            "percentage_difference",
            "tolerance_percentage",
            "penalty_amount",
            "within_tolerance",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "weight_difference",
            "percentage_difference",
            "penalty_amount",
            "within_tolerance",
            "created_at",
            "updated_at",
        ]


class HiredTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = HiredTrip
        fields = [
            "id",
            "owner_name",
            "owner_rate_per_trip",
            "owner_total_amount",
            "settlement_status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner_total_amount", "created_at", "updated_at"]


class TripDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["delivery_note_document", "documents_verified"]

    def validate_delivery_note_document(self, value):
        if not value:
            return value
        extension = os.path.splitext(value.name)[1].lower()
        if extension not in settings.TRIP_DOCUMENT_ALLOWED_TYPES:
            raise serializers.ValidationError("Unsupported document type.")
        if value.size > settings.TRIP_DOCUMENT_MAX_UPLOAD_MB * 1024 * 1024:
            raise serializers.ValidationError("Document exceeds the allowed upload size.")
        return value


class TripDocumentMetadataSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ["id", "delivery_note_document", "file_name", "file_url", "documents_verified"]

    def get_file_name(self, obj):
        if not obj.delivery_note_document:
            return ""
        return os.path.basename(obj.delivery_note_document.name)

    def get_file_url(self, obj):
        if not obj.delivery_note_document or not settings.TRIP_DOCUMENTS_EXPOSE_DIRECT_URLS:
            return ""
        return obj.delivery_note_document.url


class TripCessSerializer(serializers.ModelSerializer):
    receipt = CessReceiptSerializer(read_only=True)

    class Meta:
        model = CessTransaction
        fields = [
            "id",
            "cess_rate",
            "county",
            "quantity",
            "amount",
            "status",
            "notes",
            "receipt",
        ]
        read_only_fields = ["id", "cess_rate", "county", "quantity", "amount", "receipt"]


class TripReadSerializer(serializers.ModelSerializer):
    weighbridge_reading = WeighbridgeReadingSerializer(read_only=True)
    discrepancy = DiscrepancySerializer(read_only=True)
    hired_trip = HiredTripSerializer(read_only=True)
    cess_transaction = TripCessSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "trip_number",
            "delivery_note_number",
            "delivery_note_document",
            "trip_date",
            "dispatch_time",
            "arrival_time",
            "vehicle",
            "driver",
            "client",
            "quarry",
            "material",
            "destination",
            "classification_label",
            "trip_type",
            "quantity_unit",
            "expected_quantity",
            "agreed_unit_price",
            "status",
            "remarks",
            "documents_verified",
            "is_active",
            "weighbridge_reading",
            "discrepancy",
            "hired_trip",
            "cess_transaction",
            "created_at",
            "updated_at",
        ]


class TripWriteSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all())
    driver_id = serializers.PrimaryKeyRelatedField(source="driver", queryset=Driver.objects.all())
    client_id = serializers.PrimaryKeyRelatedField(source="client", queryset=Client.objects.all())
    quarry_id = serializers.PrimaryKeyRelatedField(source="quarry", queryset=Quarry.objects.all())
    material_id = serializers.PrimaryKeyRelatedField(source="material", queryset=Material.objects.all())
    weighbridge_reading = WeighbridgeReadingSerializer(required=False)
    discrepancy = DiscrepancySerializer(required=False)
    hired_trip = HiredTripSerializer(required=False)
    cess_transaction = CessTransactionWriteSerializer(required=False)

    class Meta:
        model = Trip
        fields = [
            "id",
            "trip_number",
            "delivery_note_number",
            "delivery_note_document",
            "trip_date",
            "dispatch_time",
            "arrival_time",
            "vehicle_id",
            "driver_id",
            "client_id",
            "quarry_id",
            "material_id",
            "destination",
            "trip_type",
            "quantity_unit",
            "expected_quantity",
            "agreed_unit_price",
            "status",
            "remarks",
            "documents_verified",
            "is_active",
            "weighbridge_reading",
            "discrepancy",
            "hired_trip",
            "cess_transaction",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        vehicle = attrs.get("vehicle") or getattr(self.instance, "vehicle", None)
        driver = attrs.get("driver") or getattr(self.instance, "driver", None)
        if vehicle and driver:
            validate_trip_references(vehicle, driver)
        return attrs

    def _sync_discrepancy(self, trip, discrepancy_data=None):
        if not hasattr(trip, "weighbridge_reading"):
            return None

        weight_difference, percentage_difference = calculate_discrepancy(
            trip.weighbridge_reading.quarry_net_weight,
            trip.weighbridge_reading.site_net_weight,
        )
        tolerance = Decimal("2.50")
        notes = ""
        if discrepancy_data:
            tolerance = Decimal(discrepancy_data.get("tolerance_percentage", tolerance))
            notes = discrepancy_data.get("notes", "")

        within_tolerance = abs(percentage_difference) <= tolerance
        penalty_amount = Decimal("0.00")
        rule_result = evaluate_trip_rules(
            destination=trip.destination,
            client=trip.client,
            quarry=trip.quarry,
            material=trip.material,
            percentage_difference=percentage_difference,
            agreed_unit_price=trip.agreed_unit_price,
            weight_difference=weight_difference,
        )
        tolerance = rule_result["tolerance_percentage"]
        within_tolerance = abs(percentage_difference) <= tolerance
        if not within_tolerance:
            penalty_amount = rule_result["penalty_amount"]
        return Discrepancy.objects.update_or_create(
            trip=trip,
            defaults={
                "weight_difference": weight_difference,
                "percentage_difference": percentage_difference,
                "tolerance_percentage": tolerance,
                "penalty_amount": penalty_amount,
                "within_tolerance": within_tolerance,
                "notes": notes,
            },
        )[0]

    def _sync_hired_trip(self, trip, hired_trip_data=None):
        if trip.trip_type != Trip.TripType.HIRED:
            HiredTrip.objects.filter(trip=trip).delete()
            return None
        if not hired_trip_data:
            return None
        owner_total_amount = Decimal(hired_trip_data["owner_rate_per_trip"])
        return HiredTrip.objects.update_or_create(
            trip=trip,
            defaults={
                **hired_trip_data,
                "owner_total_amount": owner_total_amount,
            },
        )[0]

    def _sync_cess_transaction(self, trip, cess_data=None):
        if not cess_data:
            return None

        receipt_data = cess_data.pop("receipt", None)
        cess_rate = cess_data.get("cess_rate")
        if not cess_rate:
            cess_rate = resolve_applicable_cess_rate(
                county=trip.quarry.county,
                material=trip.material,
                on_date=trip.trip_date,
            )

        quantity = trip.expected_quantity
        if hasattr(trip, "weighbridge_reading") and trip.weighbridge_reading.site_net_weight:
            quantity = trip.weighbridge_reading.site_net_weight

        amount = cess_data.get("amount")
        if cess_rate and (not amount or Decimal(amount) == Decimal("0")):
            amount = calculate_cess_amount(cess_rate, quantity)

        transaction = CessTransaction.objects.update_or_create(
            trip=trip,
            defaults={
                **cess_data,
                "cess_rate": cess_rate,
                "county": trip.quarry.county,
                "quantity": quantity,
                "amount": amount or Decimal("0.00"),
            },
        )[0]

        if receipt_data:
            CessReceipt.objects.update_or_create(
                transaction=transaction,
                defaults=receipt_data,
            )
        return transaction

    def create(self, validated_data):
        weighbridge_data = validated_data.pop("weighbridge_reading", None)
        discrepancy_data = validated_data.pop("discrepancy", None)
        hired_trip_data = validated_data.pop("hired_trip", None)
        cess_transaction_data = validated_data.pop("cess_transaction", None)
        classification_label = evaluate_trip_rules(
            destination=validated_data.get("destination", ""),
            client=validated_data.get("client"),
            quarry=validated_data.get("quarry"),
            material=validated_data.get("material"),
        )["classification_label"]
        validated_data["classification_label"] = classification_label
        trip = Trip.objects.create(**validated_data)
        if weighbridge_data:
            WeighbridgeReadingSerializer().create({**weighbridge_data, "trip": trip})
        self._sync_discrepancy(trip, discrepancy_data)
        self._sync_hired_trip(trip, hired_trip_data)
        self._sync_cess_transaction(trip, cess_transaction_data)
        return trip

    def update(self, instance, validated_data):
        weighbridge_data = validated_data.pop("weighbridge_reading", None)
        discrepancy_data = validated_data.pop("discrepancy", None)
        hired_trip_data = validated_data.pop("hired_trip", None)
        cess_transaction_data = validated_data.pop("cess_transaction", None)
        rule_result = evaluate_trip_rules(
            destination=validated_data.get("destination", instance.destination),
            client=validated_data.get("client", instance.client),
            quarry=validated_data.get("quarry", instance.quarry),
            material=validated_data.get("material", instance.material),
        )
        validated_data["classification_label"] = rule_result["classification_label"]
        instance = super().update(instance, validated_data)

        if weighbridge_data:
            if hasattr(instance, "weighbridge_reading"):
                serializer = WeighbridgeReadingSerializer(
                    instance.weighbridge_reading,
                    data=weighbridge_data,
                    partial=True,
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
            else:
                WeighbridgeReadingSerializer().create({**weighbridge_data, "trip": instance})

        self._sync_discrepancy(instance, discrepancy_data)
        self._sync_hired_trip(instance, hired_trip_data)
        self._sync_cess_transaction(instance, cess_transaction_data)
        return instance

    def to_representation(self, instance):
        return TripReadSerializer(instance, context=self.context).data


class TripSummarySerializer(serializers.ModelSerializer):
    penalty_amount = serializers.DecimalField(
        source="discrepancy.penalty_amount",
        max_digits=12,
        decimal_places=2,
        read_only=True,
        default=Decimal("0.00"),
    )
    cess_amount = serializers.DecimalField(
        source="cess_transaction.amount",
        max_digits=12,
        decimal_places=2,
        read_only=True,
        default=Decimal("0.00"),
    )
    net_weight = serializers.DecimalField(
        source="weighbridge_reading.site_net_weight",
        max_digits=12,
        decimal_places=2,
        read_only=True,
        default=Decimal("0.00"),
    )

    class Meta:
        model = Trip
        fields = [
            "id",
            "trip_number",
            "trip_date",
            "classification_label",
            "status",
            "trip_type",
            "client",
            "vehicle",
            "driver",
            "material",
            "destination",
            "expected_quantity",
            "agreed_unit_price",
            "net_weight",
            "penalty_amount",
            "cess_amount",
            "documents_verified",
        ]
