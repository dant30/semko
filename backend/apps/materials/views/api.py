from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.materials.models import Material, MaterialPrice
from apps.materials.serializers import (
    MaterialPriceSerializer,
    MaterialPriceWriteSerializer,
    MaterialReadSerializer,
    MaterialWriteSerializer,
)


class MaterialListCreateAPIView(generics.ListCreateAPIView):
    queryset = Material.objects.prefetch_related("prices").order_by("name")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MATERIALS],
        "POST": [RolePermissionCodes.MANAGE_MATERIALS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MaterialWriteSerializer
        return MaterialReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        unit = self.request.query_params.get("unit_of_measure")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(code__icontains=search)
                | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if unit:
            queryset = queryset.filter(unit_of_measure=unit)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class MaterialDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.prefetch_related("prices")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MATERIALS],
        "PUT": [RolePermissionCodes.MANAGE_MATERIALS],
        "PATCH": [RolePermissionCodes.MANAGE_MATERIALS],
        "DELETE": [RolePermissionCodes.MANAGE_MATERIALS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return MaterialWriteSerializer
        return MaterialReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaterialPriceListCreateAPIView(generics.ListCreateAPIView):
    queryset = MaterialPrice.objects.select_related("material").order_by(
        "-effective_from", "-created_at"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MATERIALS],
        "POST": [RolePermissionCodes.MANAGE_MATERIALS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MaterialPriceWriteSerializer
        return MaterialPriceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        material_id = self.request.query_params.get("material_id")
        active_only = self.request.query_params.get("active_only")
        current_only = self.request.query_params.get("current_only")

        if material_id:
            queryset = queryset.filter(material_id=material_id)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        if current_only == "true":
            from django.utils import timezone

            today = timezone.now().date()
            queryset = queryset.filter(
                effective_from__lte=today
            ).filter(Q(effective_to__isnull=True) | Q(effective_to__gte=today))
        return queryset


class MaterialPriceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaterialPrice.objects.select_related("material")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_MATERIALS],
        "PUT": [RolePermissionCodes.MANAGE_MATERIALS],
        "PATCH": [RolePermissionCodes.MANAGE_MATERIALS],
        "DELETE": [RolePermissionCodes.MANAGE_MATERIALS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return MaterialPriceWriteSerializer
        return MaterialPriceSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)
