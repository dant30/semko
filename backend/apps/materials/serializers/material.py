from rest_framework import serializers

from apps.materials.models import Material, MaterialPrice


class MaterialPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialPrice
        fields = [
            "id",
            "material",
            "price_per_unit",
            "currency",
            "effective_from",
            "effective_to",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"material": {"required": False}}


class MaterialReadSerializer(serializers.ModelSerializer):
    prices = MaterialPriceSerializer(many=True, read_only=True)

    class Meta:
        model = Material
        fields = [
            "id",
            "name",
            "code",
            "category",
            "unit_of_measure",
            "description",
            "density_factor",
            "is_active",
            "prices",
            "created_at",
            "updated_at",
        ]


class MaterialWriteSerializer(serializers.ModelSerializer):
    initial_price = MaterialPriceSerializer(write_only=True, required=False)

    class Meta:
        model = Material
        fields = [
            "id",
            "name",
            "code",
            "category",
            "unit_of_measure",
            "description",
            "density_factor",
            "is_active",
            "initial_price",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        initial_price = validated_data.pop("initial_price", None)
        material = Material.objects.create(**validated_data)
        if initial_price:
            MaterialPrice.objects.create(material=material, **initial_price)
        return material


class MaterialPriceWriteSerializer(serializers.ModelSerializer):
    material_id = serializers.PrimaryKeyRelatedField(
        source="material",
        queryset=Material.objects.all(),
    )

    class Meta:
        model = MaterialPrice
        fields = [
            "id",
            "material_id",
            "price_per_unit",
            "currency",
            "effective_from",
            "effective_to",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]
