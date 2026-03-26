from rest_framework import generics

from apps.cess.models import CessRate, CessTransaction
from apps.cess.serializers import (
    CessRateSerializer,
    CessTransactionSerializer,
    CessTransactionWriteSerializer,
)
from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions


class CessRateListCreateAPIView(generics.ListCreateAPIView):
    queryset = CessRate.objects.select_related("material").order_by("county", "material__name")
    serializer_class = CessRateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CESS],
        "POST": [RolePermissionCodes.MANAGE_CESS],
    }


class CessRateDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CessRate.objects.select_related("material")
    serializer_class = CessRateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CESS],
        "PUT": [RolePermissionCodes.MANAGE_CESS],
        "PATCH": [RolePermissionCodes.MANAGE_CESS],
        "DELETE": [RolePermissionCodes.MANAGE_CESS],
    }


class CessTransactionListAPIView(generics.ListAPIView):
    queryset = CessTransaction.objects.select_related("trip", "cess_rate").prefetch_related("receipt")
    serializer_class = CessTransactionSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CESS],
    }


class CessTransactionDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = CessTransaction.objects.select_related("trip", "cess_rate").prefetch_related("receipt")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CESS],
        "PUT": [RolePermissionCodes.MANAGE_CESS],
        "PATCH": [RolePermissionCodes.MANAGE_CESS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return CessTransactionWriteSerializer
        return CessTransactionSerializer
