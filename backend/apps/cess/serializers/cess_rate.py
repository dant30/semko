from rest_framework import serializers

from apps.cess.models import CessRate, CessReceipt, CessTransaction


class CessRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CessRate
        fields = [
            "id",
            "name",
            "code",
            "county",
            "material",
            "rate_type",
            "amount",
            "effective_from",
            "effective_to",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CessReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = CessReceipt
        fields = [
            "id",
            "receipt_number",
            "receipt_document",
            "payment_date",
            "amount_paid",
            "verified",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CessTransactionSerializer(serializers.ModelSerializer):
    receipt = CessReceiptSerializer(read_only=True)
    cess_rate_id = serializers.PrimaryKeyRelatedField(
        source="cess_rate",
        queryset=CessRate.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = CessTransaction
        fields = [
            "id",
            "trip",
            "cess_rate",
            "cess_rate_id",
            "county",
            "quantity",
            "amount",
            "status",
            "notes",
            "receipt",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "cess_rate", "created_at", "updated_at"]


class CessTransactionWriteSerializer(serializers.ModelSerializer):
    cess_rate_id = serializers.PrimaryKeyRelatedField(
        source="cess_rate",
        queryset=CessRate.objects.all(),
        required=False,
        allow_null=True,
    )
    receipt = CessReceiptSerializer(required=False)

    class Meta:
        model = CessTransaction
        fields = [
            "id",
            "trip",
            "cess_rate_id",
            "county",
            "quantity",
            "amount",
            "status",
            "notes",
            "receipt",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "trip": {"required": False},
            "county": {"required": False},
            "quantity": {"required": False},
            "amount": {"required": False},
            "status": {"required": False},
            "notes": {"required": False},
        }
