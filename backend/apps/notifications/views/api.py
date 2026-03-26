from datetime import timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions, IsAuthenticatedAndActive
from apps.core.utils.permissions import user_has_role_permission
from apps.notifications.models import Notification, NotificationPreference, NotificationTemplate
from apps.notifications.serializers import (
    NotificationPreferenceSerializer,
    NotificationSerializer,
    NotificationTemplateSerializer,
)


class NotificationListAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user).prefetch_related("logs")

        status_filter = self.request.query_params.get("status")
        if status_filter == "archived":
            queryset = queryset.filter(is_archived=True)
        elif status_filter == "read":
            queryset = queryset.filter(is_read=True, is_archived=False)
        elif status_filter == "unread":
            queryset = queryset.filter(is_read=False, is_archived=False)
        else:
            queryset = queryset.filter(is_archived=False)

        channel = self.request.query_params.get("channel")
        if channel:
            queryset = queryset.filter(channel=channel)

        event_code = self.request.query_params.get("event_code")
        if event_code:
            queryset = queryset.filter(event_code=event_code)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(message__icontains=search))

        return queryset


class NotificationArchivedListAPIView(NotificationListAPIView):
    def get_queryset(self):
        queryset = super().get_queryset().filter(is_archived=True)
        return queryset


class NotificationDetailAPIView(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).prefetch_related("logs")


class NotificationMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at", "updated_at"])
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationBulkMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def post(self, request):
        notification_ids = request.data.get("notification_ids", [])
        if not isinstance(notification_ids, list):
            return Response({"detail": "notification_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user,
            is_archived=False,
        ).update(is_read=True, read_at=timezone.now(), updated_at=timezone.now())

        return Response({"success": True, "updated_count": updated_count}, status=status.HTTP_200_OK)


class NotificationBulkMarkArchivedAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def post(self, request):
        notification_ids = request.data.get("notification_ids", [])
        if not isinstance(notification_ids, list):
            return Response({"detail": "notification_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Notification.objects.filter(id__in=notification_ids, recipient=request.user).update(
            is_archived=True,
            archived_at=timezone.now(),
            updated_at=timezone.now(),
        )

        return Response({"success": True, "updated_count": updated_count}, status=status.HTTP_200_OK)


class NotificationBulkDeleteAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def post(self, request):
        notification_ids = request.data.get("notification_ids", [])
        if not isinstance(notification_ids, list):
            return Response({"detail": "notification_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        delete_queryset = Notification.objects.filter(id__in=notification_ids, recipient=request.user)
        deleted_count, _ = delete_queryset.delete()

        return Response({"success": True, "deleted_count": deleted_count}, status=status.HTTP_200_OK)


class NotificationSummaryAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def get(self, request):
        qs = Notification.objects.filter(recipient=request.user)

        total_notifications = qs.count()
        total_archived = qs.filter(is_archived=True).count()
        total_read = qs.filter(is_read=True, is_archived=False).count()
        total_unread = qs.filter(is_read=False, is_archived=False).count()

        by_channel = {
            "email": qs.filter(channel=Notification.Channel.EMAIL).count(),
            "sms": qs.filter(channel=Notification.Channel.SMS).count(),
            "push": 0,
            "in_app": qs.filter(channel=Notification.Channel.IN_APP).count(),
        }

        by_status = {
            "unread": total_unread,
            "read": total_read,
            "archived": total_archived,
        }

        recent_period = timezone.now() - timedelta(days=7)
        recent_count = qs.filter(created_at__gte=recent_period).count()

        return Response(
            {
                "total_notifications": total_notifications,
                "total_unread": total_unread,
                "total_read": total_read,
                "total_archived": total_archived,
                "by_channel": by_channel,
                "by_status": by_status,
                "recent_count": recent_count,
            },
            status=status.HTTP_200_OK,
        )


class NotificationTemplateListCreateAPIView(generics.ListCreateAPIView):
    queryset = NotificationTemplate.objects.order_by("event_code", "audience", "channel")
    serializer_class = NotificationTemplateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_NOTIFICATIONS],
        "POST": [RolePermissionCodes.MANAGE_NOTIFICATIONS],
    }


class NotificationTemplateDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NotificationTemplate.objects.order_by("event_code", "audience", "channel")
    serializer_class = NotificationTemplateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_NOTIFICATIONS],
        "PUT": [RolePermissionCodes.MANAGE_NOTIFICATIONS],
        "PATCH": [RolePermissionCodes.MANAGE_NOTIFICATIONS],
        "DELETE": [RolePermissionCodes.MANAGE_NOTIFICATIONS],
    }


class NotificationPreferenceListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_queryset(self):
        queryset = NotificationPreference.objects.select_related("user", "role").order_by(
            "channel",
            "category",
            "event_code",
        )
        if user_has_role_permission(self.request.user, RolePermissionCodes.VIEW_NOTIFICATIONS):
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if user_has_role_permission(self.request.user, RolePermissionCodes.MANAGE_NOTIFICATIONS):
            serializer.save()
            return
        serializer.save(user=self.request.user, role=None)


class NotificationPreferenceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_queryset(self):
        queryset = NotificationPreference.objects.select_related("user", "role")
        if user_has_role_permission(self.request.user, RolePermissionCodes.VIEW_NOTIFICATIONS):
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if not user_has_role_permission(self.request.user, RolePermissionCodes.MANAGE_NOTIFICATIONS):
            if instance.user_id != self.request.user.id:
                raise PermissionDenied("You can only manage your own notification preferences.")
            serializer.save(user=self.request.user, role=None)
            return
        serializer.save()
