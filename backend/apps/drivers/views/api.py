from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.drivers.models import Driver, DriverLicense
from apps.drivers.serializers import (
    DriverLicenseSerializer,
    DriverLicenseWriteSerializer,
    DriverReadSerializer,
    DriverWithLicenseCreateSerializer,
    DriverWriteSerializer,
)


class DriverListCreateAPIView(generics.ListCreateAPIView):
    queryset = Driver.objects.select_related("license").order_by(
        "first_name", "last_name", "employee_id"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_DRIVERS],
        "POST": [RolePermissionCodes.MANAGE_DRIVERS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DriverWithLicenseCreateSerializer
        return DriverReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        status_value = self.request.query_params.get("employment_status")
        active_only = self.request.query_params.get("active_only")
        license_status = self.request.query_params.get("license_status")

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(employee_id__icontains=search)
                | Q(national_id__icontains=search)
                | Q(phone_number__icontains=search)
            )
        if status_value:
            queryset = queryset.filter(employment_status=status_value)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        if license_status:
            queryset = queryset.filter(license__status=license_status)
        return queryset


class DriverDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Driver.objects.select_related("license")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_DRIVERS],
        "PUT": [RolePermissionCodes.MANAGE_DRIVERS],
        "PATCH": [RolePermissionCodes.MANAGE_DRIVERS],
        "DELETE": [RolePermissionCodes.MANAGE_DRIVERS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return DriverWriteSerializer
        return DriverReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.employment_status = Driver.EmploymentStatus.INACTIVE
        instance.save(update_fields=["is_active", "employment_status", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DriverLicenseDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = DriverLicense.objects.select_related("driver")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_DRIVERS],
        "PUT": [RolePermissionCodes.MANAGE_DRIVERS],
        "PATCH": [RolePermissionCodes.MANAGE_DRIVERS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return DriverLicenseWriteSerializer
        return DriverLicenseSerializer
