from rest_framework import serializers

from apps.clients.models import Client, CorporateClientProfile, IndividualClientProfile


class CorporateClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorporateClientProfile
        fields = [
            "id",
            "company_registration_number",
            "kra_pin",
            "credit_limit",
            "payment_terms_days",
            "industry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IndividualClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualClientProfile
        fields = [
            "id",
            "national_id",
            "kra_pin",
            "occupation",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ClientReadSerializer(serializers.ModelSerializer):
    corporate_profile = CorporateClientProfileSerializer(read_only=True)
    individual_profile = IndividualClientProfileSerializer(read_only=True)

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "code",
            "client_type",
            "contact_person",
            "phone_number",
            "alternate_phone_number",
            "email",
            "address",
            "town",
            "county",
            "status",
            "notes",
            "is_active",
            "corporate_profile",
            "individual_profile",
            "created_at",
            "updated_at",
        ]


class ClientWriteSerializer(serializers.ModelSerializer):
    corporate_profile = CorporateClientProfileSerializer(required=False)
    individual_profile = IndividualClientProfileSerializer(required=False)

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "code",
            "client_type",
            "contact_person",
            "phone_number",
            "alternate_phone_number",
            "email",
            "address",
            "town",
            "county",
            "status",
            "notes",
            "is_active",
            "corporate_profile",
            "individual_profile",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        client_type = attrs.get("client_type", getattr(self.instance, "client_type", None))
        corporate_profile = attrs.get("corporate_profile")
        individual_profile = attrs.get("individual_profile")

        if client_type == Client.ClientType.CORPORATE:
            if not corporate_profile and not getattr(self.instance, "corporate_profile", None):
                raise serializers.ValidationError(
                    {"corporate_profile": "Corporate profile is required for corporate clients."}
                )
            if individual_profile:
                raise serializers.ValidationError(
                    {"individual_profile": "Individual profile is not allowed for corporate clients."}
                )
        if client_type == Client.ClientType.INDIVIDUAL:
            if not individual_profile and not getattr(self.instance, "individual_profile", None):
                raise serializers.ValidationError(
                    {"individual_profile": "Individual profile is required for individual clients."}
                )
            if corporate_profile:
                raise serializers.ValidationError(
                    {"corporate_profile": "Corporate profile is not allowed for individual clients."}
                )
        return attrs

    def create(self, validated_data):
        corporate_data = validated_data.pop("corporate_profile", None)
        individual_data = validated_data.pop("individual_profile", None)
        client = Client.objects.create(**validated_data)
        if corporate_data:
            CorporateClientProfile.objects.create(client=client, **corporate_data)
        if individual_data:
            IndividualClientProfile.objects.create(client=client, **individual_data)
        return client

    def update(self, instance, validated_data):
        corporate_data = validated_data.pop("corporate_profile", None)
        individual_data = validated_data.pop("individual_profile", None)
        client = super().update(instance, validated_data)

        if corporate_data is not None:
            CorporateClientProfile.objects.update_or_create(
                client=client,
                defaults=corporate_data,
            )
        if individual_data is not None:
            IndividualClientProfile.objects.update_or_create(
                client=client,
                defaults=individual_data,
            )
        return client
