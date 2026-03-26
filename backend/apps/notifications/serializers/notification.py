from rest_framework import serializers

from apps.notifications.models import (
    Notification,
    NotificationLog,
    NotificationPreference,
    NotificationTemplate,
)


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = ["id", "status", "channel", "detail", "created_at"]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    logs = NotificationLogSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "category",
            "channel",
            "event_code",
            "audience",
            "is_read",
            "read_at",
            "is_archived",
            "archived_at",
            "status",
            "metadata",
            "logs",
            "created_at",
            "updated_at",
        ]

    def get_status(self, obj):
        return obj.status


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "event_code",
            "audience",
            "channel",
            "title_template",
            "body_template",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "user",
            "role",
            "channel",
            "category",
            "event_code",
            "is_enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        read_only_fields = [
            "id",
            "title",
            "message",
            "category",
            "channel",
            "event_code",
            "audience",
            "metadata",
            "logs",
            "created_at",
            "updated_at",
        ]
