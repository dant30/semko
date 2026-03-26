from rest_framework import serializers

from apps.trips.calculators.penalty import calculate_net_weight
from apps.trips.models import WeighbridgeReading


class WeighbridgeReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeighbridgeReading
        fields = [
            "id",
            "quarry_gross_weight",
            "quarry_tare_weight",
            "quarry_net_weight",
            "site_gross_weight",
            "site_tare_weight",
            "site_net_weight",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "quarry_net_weight",
            "site_net_weight",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if attrs["quarry_gross_weight"] < attrs["quarry_tare_weight"]:
            raise serializers.ValidationError(
                {"quarry_gross_weight": "Quarry gross weight must be >= quarry tare weight."}
            )
        if attrs["site_gross_weight"] < attrs["site_tare_weight"]:
            raise serializers.ValidationError(
                {"site_gross_weight": "Site gross weight must be >= site tare weight."}
            )
        return attrs

    def create(self, validated_data):
        validated_data["quarry_net_weight"] = calculate_net_weight(
            validated_data["quarry_gross_weight"],
            validated_data["quarry_tare_weight"],
        )
        validated_data["site_net_weight"] = calculate_net_weight(
            validated_data["site_gross_weight"],
            validated_data["site_tare_weight"],
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.quarry_net_weight = calculate_net_weight(
            instance.quarry_gross_weight,
            instance.quarry_tare_weight,
        )
        instance.site_net_weight = calculate_net_weight(
            instance.site_gross_weight,
            instance.site_tare_weight,
        )
        instance.save()
        return instance
