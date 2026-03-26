from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.maintenance.models import Mechanic, MaintenanceSchedule, PartUsed, ServiceRecord
from apps.maintenance.serializers import (
    MaintenanceScheduleSerializer,
    MaintenanceScheduleWriteSerializer,
    MechanicSerializer,
    MechanicWriteSerializer,
    PartUsedSerializer,
    PartUsedWriteSerializer,
    ServiceRecordSerializer,
    ServiceRecordWriteSerializer,
)
from apps.maintenance.serializers.maintenance import _recalculate_service_costs


class MechanicListCreateAPIView(generics.ListCreateAPIView):
    queryset = Mechanic.objects.order_by("first_name", "last_name")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "POST": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return MechanicWriteSerializer if self.request.method == "POST" else MechanicSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        employment_type = self.request.query_params.get("employment_type")
        active_only = self.request.query_params.get("active_only")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(employee_id__icontains=search)
                | Q(specialization__icontains=search)
            )
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class MechanicDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mechanic.objects.all()
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "PUT": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "PATCH": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "DELETE": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return MechanicWriteSerializer if self.request.method in {"PUT", "PATCH"} else MechanicSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaintenanceScheduleListCreateAPIView(generics.ListCreateAPIView):
    queryset = MaintenanceSchedule.objects.select_related("vehicle").order_by(
        "next_due_date",
        "-created_at",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "POST": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return (
            MaintenanceScheduleWriteSerializer
            if self.request.method == "POST"
            else MaintenanceScheduleSerializer
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        vehicle_id = self.request.query_params.get("vehicle_id")
        maintenance_type = self.request.query_params.get("maintenance_type")
        schedule_status = self.request.query_params.get("status")
        active_only = self.request.query_params.get("active_only")
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        if maintenance_type:
            queryset = queryset.filter(maintenance_type=maintenance_type)
        if schedule_status:
            queryset = queryset.filter(status=schedule_status)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class MaintenanceScheduleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaintenanceSchedule.objects.select_related("vehicle")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "PUT": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "PATCH": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "DELETE": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return (
            MaintenanceScheduleWriteSerializer
            if self.request.method in {"PUT", "PATCH"}
            else MaintenanceScheduleSerializer
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ServiceRecordListCreateAPIView(generics.ListCreateAPIView):
    queryset = ServiceRecord.objects.select_related(
        "vehicle",
        "schedule",
        "mechanic",
    ).prefetch_related("parts_used__item").order_by("-service_date", "-created_at")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "POST": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return ServiceRecordWriteSerializer if self.request.method == "POST" else ServiceRecordSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        vehicle_id = self.request.query_params.get("vehicle_id")
        mechanic_id = self.request.query_params.get("mechanic_id")
        record_status = self.request.query_params.get("status")
        active_only = self.request.query_params.get("active_only")
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        if mechanic_id:
            queryset = queryset.filter(mechanic_id=mechanic_id)
        if record_status:
            queryset = queryset.filter(status=record_status)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class ServiceRecordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceRecord.objects.select_related(
        "vehicle",
        "schedule",
        "mechanic",
    ).prefetch_related("parts_used__item")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "PUT": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "PATCH": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "DELETE": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return ServiceRecordWriteSerializer if self.request.method in {"PUT", "PATCH"} else ServiceRecordSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PartUsedListCreateAPIView(generics.ListCreateAPIView):
    queryset = PartUsed.objects.select_related("service_record", "item").order_by(
        "-created_at"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "POST": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return PartUsedWriteSerializer if self.request.method == "POST" else PartUsedSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        service_record_id = self.request.query_params.get("service_record_id")
        item_id = self.request.query_params.get("item_id")
        active_only = self.request.query_params.get("active_only")
        if service_record_id:
            queryset = queryset.filter(service_record_id=service_record_id)
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class PartUsedDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PartUsed.objects.select_related("service_record", "item")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MAINTENANCE],
        "PUT": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "PATCH": [RolePermissionCodes.MANAGE_MAINTENANCE],
        "DELETE": [RolePermissionCodes.MANAGE_MAINTENANCE],
    }

    def get_serializer_class(self):
        return PartUsedWriteSerializer if self.request.method in {"PUT", "PATCH"} else PartUsedSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        _recalculate_service_costs(instance.service_record)

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)
