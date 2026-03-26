from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.vehicles.models import Vehicle, VehicleOwnership, VehicleType
from apps.vehicles.serializers import (
    VehicleOwnershipSerializer,
    VehicleReadSerializer,
    VehicleTypeSerializer,
    VehicleWriteSerializer,
)


class VehicleTypeListCreateAPIView(generics.ListCreateAPIView):
    queryset = VehicleType.objects.order_by("name")
    serializer_class = VehicleTypeSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "POST": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get("active_only") == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class VehicleTypeDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VehicleType.objects.all()
    serializer_class = VehicleTypeSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "PUT": [RolePermissionCodes.MANAGE_VEHICLES],
        "PATCH": [RolePermissionCodes.MANAGE_VEHICLES],
        "DELETE": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleOwnershipListCreateAPIView(generics.ListCreateAPIView):
    queryset = VehicleOwnership.objects.order_by("name", "-effective_from")
    serializer_class = VehicleOwnershipSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "POST": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        ownership_type = self.request.query_params.get("ownership_type")
        if ownership_type:
            queryset = queryset.filter(ownership_type=ownership_type)
        if self.request.query_params.get("active_only") == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class VehicleOwnershipDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VehicleOwnership.objects.all()
    serializer_class = VehicleOwnershipSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "PUT": [RolePermissionCodes.MANAGE_VEHICLES],
        "PATCH": [RolePermissionCodes.MANAGE_VEHICLES],
        "DELETE": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.select_related("vehicle_type", "ownership").order_by(
        "registration_number"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "POST": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VehicleWriteSerializer
        return VehicleReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        status_value = self.request.query_params.get("status")
        ownership_type = self.request.query_params.get("ownership_type")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(registration_number__icontains=search)
                | Q(fleet_number__icontains=search)
                | Q(make__icontains=search)
                | Q(model__icontains=search)
            )
        if status_value:
            queryset = queryset.filter(status=status_value)
        if ownership_type:
            queryset = queryset.filter(ownership__ownership_type=ownership_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class VehicleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.select_related("vehicle_type", "ownership")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "PUT": [RolePermissionCodes.MANAGE_VEHICLES],
        "PATCH": [RolePermissionCodes.MANAGE_VEHICLES],
        "DELETE": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return VehicleWriteSerializer
        return VehicleReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = Vehicle.Status.INACTIVE
        instance.save(update_fields=["is_active", "status", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)
