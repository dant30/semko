from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response

from apps.clients.models import Client, Quarry
from apps.clients.serializers import ClientReadSerializer, ClientWriteSerializer, QuarrySerializer
from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions


class ClientListCreateAPIView(generics.ListCreateAPIView):
    queryset = Client.objects.prefetch_related(
        "corporate_profile",
        "individual_profile",
    ).order_by("name", "code")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CLIENTS],
        "POST": [RolePermissionCodes.MANAGE_CLIENTS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ClientWriteSerializer
        return ClientReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        client_type = self.request.query_params.get("client_type")
        status_value = self.request.query_params.get("status")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(code__icontains=search)
                | Q(contact_person__icontains=search)
                | Q(phone_number__icontains=search)
                | Q(email__icontains=search)
            )
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class ClientDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.prefetch_related("corporate_profile", "individual_profile")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CLIENTS],
        "PUT": [RolePermissionCodes.MANAGE_CLIENTS],
        "PATCH": [RolePermissionCodes.MANAGE_CLIENTS],
        "DELETE": [RolePermissionCodes.MANAGE_CLIENTS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return ClientWriteSerializer
        return ClientReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = Client.Status.INACTIVE
        instance.save(update_fields=["is_active", "status", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuarryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Quarry.objects.select_related("client").order_by("name")
    serializer_class = QuarrySerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CLIENTS],
        "POST": [RolePermissionCodes.MANAGE_CLIENTS],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        county = self.request.query_params.get("county")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(code__icontains=search)
                | Q(contact_person__icontains=search)
                | Q(client__name__icontains=search)
            )
        if county:
            queryset = queryset.filter(county__iexact=county)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class QuarryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quarry.objects.select_related("client")
    serializer_class = QuarrySerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_CLIENTS],
        "PUT": [RolePermissionCodes.MANAGE_CLIENTS],
        "PATCH": [RolePermissionCodes.MANAGE_CLIENTS],
        "DELETE": [RolePermissionCodes.MANAGE_CLIENTS],
    }

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)
