from django.db.models import Q
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.vehicles.constants import VehicleStatus
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.vehicle_type import VehicleType
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.serializers import (
    VehicleOwnershipSerializer,
    VehicleOwnershipWriteSerializer,
    VehicleReadSerializer,
    VehicleTypeSerializer,
    VehicleWithOwnershipCreateSerializer,
    VehicleWriteSerializer,
)


class VehicleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.select_related("vehicle_type").prefetch_related("ownership").order_by(
        "registration_number"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "POST": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VehicleWithOwnershipCreateSerializer
        return VehicleReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        status_filter = self.request.query_params.get("status")
        vehicle_type = self.request.query_params.get("vehicle_type")
        active_only = self.request.query_params.get("active_only")
        available_only = self.request.query_params.get("available_only")

        if search:
            queryset = queryset.filter(
                Q(registration_number__icontains=search)
                | Q(vin__icontains=search)
                | Q(make__icontains=search)
                | Q(model__icontains=search)
                | Q(engine_number__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if vehicle_type:
            queryset = queryset.filter(vehicle_type_id=vehicle_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        if available_only == "true":
            queryset = queryset.filter(status=VehicleStatus.ACTIVE, is_active=True)
        return queryset


class VehicleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.select_related("vehicle_type").prefetch_related("ownership")
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
        if instance.status == VehicleStatus.ACTIVE:
            instance.status = VehicleStatus.STANDBY
        instance.save(update_fields=["is_active", "status", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleOwnershipListCreateAPIView(generics.ListCreateAPIView):
    queryset = VehicleOwnership.objects.select_related("vehicle").order_by("vehicle__registration_number")
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
            queryset = queryset.filter(vehicle__is_active=True)
        return queryset


class VehicleOwnershipDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = VehicleOwnership.objects.select_related("vehicle")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "PUT": [RolePermissionCodes.MANAGE_VEHICLES],
        "PATCH": [RolePermissionCodes.MANAGE_VEHICLES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return VehicleOwnershipWriteSerializer
        return VehicleOwnershipSerializer


class VehicleTypeListCreateAPIView(generics.ListCreateAPIView):
    queryset = VehicleType.objects.filter(is_active=True).order_by("name")
    serializer_class = VehicleTypeSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_VEHICLES],
        "POST": [RolePermissionCodes.MANAGE_VEHICLES],
    }


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
        if instance.vehicles.exists():
            raise PermissionDenied("Cannot delete a vehicle type that has assigned vehicles.")
        instance.delete()
