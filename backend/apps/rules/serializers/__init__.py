from rest_framework import serializers

from apps.rules.models import DeductionRule, PenaltyThresholdRule, StatutoryRate, TripClassificationRule


class TripClassificationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripClassificationRule
        fields = [
            "id",
            "name",
            "code",
            "classification_label",
            "destination_keyword",
            "client",
            "quarry",
            "material",
            "bonus_amount",
            "priority",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PenaltyThresholdRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PenaltyThresholdRule
        fields = [
            "id",
            "name",
            "code",
            "minimum_percentage",
            "maximum_percentage",
            "tolerance_percentage",
            "penalty_multiplier",
            "priority",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StatutoryRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatutoryRate
        fields = [
            "id",
            "name",
            "code",
            "statutory_type",
            "calculation_method",
            "apply_on",
            "rate_value",
            "minimum_amount",
            "maximum_amount",
            "effective_from",
            "effective_to",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DeductionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeductionRule
        fields = [
            "id",
            "name",
            "code",
            "deduction_category",
            "calculation_method",
            "apply_on",
            "rate_value",
            "minimum_verified_trips",
            "require_verified_documents",
            "effective_from",
            "effective_to",
            "priority",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
