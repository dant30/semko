from rest_framework import serializers

from apps.clients.models import Client, Quarry


class QuarrySerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
        required=False,
        allow_null=True,
    )
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Quarry
        fields = [
            "id",
            "name",
            "code",
            "client_id",
            "client_name",
            "county",
            "town",
            "location_description",
            "contact_person",
            "phone_number",
            "email",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client_name", "created_at", "updated_at"]
