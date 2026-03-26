from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.fuel.models import FuelConsumption, FuelStation, FuelTransaction
from apps.fuel.serializers import (
    FuelConsumptionSerializer,
    FuelConsumptionWriteSerializer,
    FuelStationSerializer,
    FuelStationWriteSerializer,
    FuelTransactionSerializer,
    FuelTransactionWriteSerializer,
)


class FuelStationListCreateAPIView(generics.ListCreateAPIView):
    queryset = FuelStation.objects.order_by("name")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "POST": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FuelStationWriteSerializer
        return FuelStationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        station_type = self.request.query_params.get("station_type")
        active_only = self.request.query_params.get("active_only")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(code__icontains=search)
                | Q(location__icontains=search)
            )
        if station_type:
            queryset = queryset.filter(station_type=station_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class FuelStationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FuelStation.objects.all()
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "PUT": [RolePermissionCodes.MANAGE_FUEL],
        "PATCH": [RolePermissionCodes.MANAGE_FUEL],
        "DELETE": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return FuelStationWriteSerializer
        return FuelStationSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FuelTransactionListCreateAPIView(generics.ListCreateAPIView):
    queryset = FuelTransaction.objects.select_related(
        "vehicle",
        "driver",
        "trip",
        "station",
    ).order_by("-transaction_date", "-created_at")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "POST": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FuelTransactionWriteSerializer
        return FuelTransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        vehicle_id = self.request.query_params.get("vehicle_id")
        station_id = self.request.query_params.get("station_id")
        fuel_type = self.request.query_params.get("fuel_type")
        active_only = self.request.query_params.get("active_only")
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
        if fuel_type:
            queryset = queryset.filter(fuel_type=fuel_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class FuelTransactionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FuelTransaction.objects.select_related("vehicle", "driver", "trip", "station")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "PUT": [RolePermissionCodes.MANAGE_FUEL],
        "PATCH": [RolePermissionCodes.MANAGE_FUEL],
        "DELETE": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return FuelTransactionWriteSerializer
        return FuelTransactionSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FuelConsumptionListCreateAPIView(generics.ListCreateAPIView):
    queryset = FuelConsumption.objects.select_related("vehicle").order_by(
        "-period_end",
        "-created_at",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "POST": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FuelConsumptionWriteSerializer
        return FuelConsumptionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        vehicle_id = self.request.query_params.get("vehicle_id")
        active_only = self.request.query_params.get("active_only")
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class FuelConsumptionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FuelConsumption.objects.select_related("vehicle")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_FUEL],
        "PUT": [RolePermissionCodes.MANAGE_FUEL],
        "PATCH": [RolePermissionCodes.MANAGE_FUEL],
        "DELETE": [RolePermissionCodes.MANAGE_FUEL],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return FuelConsumptionWriteSerializer
        return FuelConsumptionSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)
