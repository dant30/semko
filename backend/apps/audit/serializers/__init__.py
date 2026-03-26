from rest_framework import serializers

from apps.audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "request_id",
            "actor",
            "actor_username",
            "action",
            "method",
            "path",
            "status_code",
            "ip_address",
            "user_agent",
            "metadata",
            "created_at",
        ]
