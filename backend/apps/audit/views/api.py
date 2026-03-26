from rest_framework import generics

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer


class AuditLogListAPIView(generics.ListAPIView):
    queryset = AuditLog.objects.select_related("actor")
    serializer_class = AuditLogSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_AUDIT_LOGS],
    }
