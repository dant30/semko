from decimal import Decimal

from django.http import FileResponse, Http404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.trips.models import Trip
from apps.trips.serializers import (
    TripDocumentMetadataSerializer,
    TripDocumentSerializer,
    TripReadSerializer,
    TripSummarySerializer,
    TripWriteSerializer,
)


class TripListCreateAPIView(generics.ListCreateAPIView):
    queryset = Trip.objects.select_related(
        "vehicle",
        "driver",
        "client",
        "quarry",
        "material",
    ).prefetch_related(
        "weighbridge_reading",
        "discrepancy",
        "hired_trip",
    ).order_by("-trip_date", "-created_at")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
        "POST": [RolePermissionCodes.MANAGE_TRIPS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TripWriteSerializer
        return TripReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        status_value = self.request.query_params.get("status")
        trip_type = self.request.query_params.get("trip_type")
        client_id = self.request.query_params.get("client_id")
        vehicle_id = self.request.query_params.get("vehicle_id")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(trip_number__icontains=search)
                | Q(delivery_note_number__icontains=search)
                | Q(destination__icontains=search)
            )
        if status_value:
            queryset = queryset.filter(status=status_value)
        if trip_type:
            queryset = queryset.filter(trip_type=trip_type)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class TripDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.select_related(
        "vehicle",
        "driver",
        "client",
        "quarry",
        "material",
    ).prefetch_related("weighbridge_reading", "discrepancy", "hired_trip")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
        "PUT": [RolePermissionCodes.MANAGE_TRIPS],
        "PATCH": [RolePermissionCodes.MANAGE_TRIPS],
        "DELETE": [RolePermissionCodes.MANAGE_TRIPS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return TripWriteSerializer
        return TripReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = Trip.Status.CANCELLED
        instance.save(update_fields=["is_active", "status", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TripDocumentUpdateAPIView(generics.UpdateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDocumentSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "PATCH": [RolePermissionCodes.MANAGE_TRIPS],
    }


class TripDocumentMetadataAPIView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDocumentMetadataSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
    }


class TripDocumentDownloadAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
    }

    def get(self, request, pk):
        trip = Trip.objects.filter(pk=pk).first()
        if not trip or not trip.delivery_note_document:
            raise Http404("Document not found.")
        return FileResponse(
            trip.delivery_note_document.open("rb"),
            as_attachment=False,
            filename=trip.delivery_note_document.name.split("/")[-1],
        )


class TripSummaryAPIView(generics.RetrieveAPIView):
    queryset = Trip.objects.select_related(
        "vehicle",
        "driver",
        "client",
        "material",
        "cess_transaction",
        "discrepancy",
        "weighbridge_reading",
    )
    serializer_class = TripSummarySerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
    }


class TripOperationsSummaryAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_TRIPS],
    }

    def get(self, request):
        queryset = Trip.objects.select_related("cess_transaction", "discrepancy")
        if request.query_params.get("active_only") == "true":
            queryset = queryset.filter(is_active=True)

        summary = {
            "total_trips": queryset.count(),
            "delivered_trips": queryset.filter(status=Trip.Status.DELIVERED).count(),
            "in_progress_trips": queryset.filter(status=Trip.Status.IN_PROGRESS).count(),
            "cancelled_trips": queryset.filter(status=Trip.Status.CANCELLED).count(),
            "documents_verified": queryset.filter(documents_verified=True).count(),
            "total_expected_quantity": str(
                sum((trip.expected_quantity for trip in queryset), Decimal("0.00"))
            ),
            "total_cess_amount": str(
                sum(
                    (
                        trip.cess_transaction.amount
                        for trip in queryset
                        if hasattr(trip, "cess_transaction")
                    ),
                    Decimal("0.00"),
                )
            ),
            "total_penalty_amount": str(
                sum(
                    (
                        trip.discrepancy.penalty_amount
                        for trip in queryset
                        if hasattr(trip, "discrepancy")
                    ),
                    Decimal("0.00"),
                )
            ),
        }
        return Response(summary)
