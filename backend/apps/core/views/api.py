from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.mixins.api_mixins import StandardizedSuccessResponseMixin
from apps.core.permissions import HasRolePermissions
from apps.core.serializers.dashboard import DashboardSummarySerializer
from apps.maintenance.models import MaintenanceSchedule
from apps.stores.models import Item, Requisition
from apps.trips.models import Trip
from apps.fuel.models import FuelTransaction
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.constants import VehicleStatus


class HealthCheckAPIView(StandardizedSuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return self.success_response(
            {
                "status": "ok",
                "service": "semko-backend",
                "app": "core",
            }
        )


class DashboardSummaryAPIView(StandardizedSuccessResponseMixin, APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_DASHBOARD],
    }

    def get(self, request):
        today = date.today()
        yesterday = today - timedelta(days=1)
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        previous_week_end = week_start - timedelta(days=1)
        previous_week_start = previous_week_end - timedelta(days=6)
        previous_month = today.replace(day=1) - timedelta(days=1)

        total_inventory_items = Item.objects.filter(is_active=True).count()
        previous_total_inventory_items = total_inventory_items

        low_stock_items = (
            Item.objects.with_stock_snapshot()
            .filter(is_active=True, is_below_reorder_level=True)
            .count()
        )
        previous_low_stock_items = low_stock_items

        trips_today = Trip.objects.filter(trip_date=today, is_active=True).count()
        previous_trips_today = Trip.objects.filter(trip_date=yesterday, is_active=True).count()

        trips_this_week = (
            Trip.objects.filter(
                trip_date__range=(week_start, week_end),
                is_active=True,
            )
            .count()
        )
        previous_trips_this_week = (
            Trip.objects.filter(
                trip_date__range=(previous_week_start, previous_week_end),
                is_active=True,
            )
            .count()
        )

        fuel_today_litres = (
            FuelTransaction.objects.filter(transaction_date=today, is_active=True)
            .aggregate(total=Sum("litres"))["total"]
            or Decimal("0.00")
        )
        previous_fuel_today_litres = (
            FuelTransaction.objects.filter(transaction_date=yesterday, is_active=True)
            .aggregate(total=Sum("litres"))["total"]
            or Decimal("0.00")
        )
        fuel_this_month_litres = (
            FuelTransaction.objects.filter(
                transaction_date__year=today.year,
                transaction_date__month=today.month,
                is_active=True,
            )
            .aggregate(total=Sum("litres"))["total"]
            or Decimal("0.00")
        )
        previous_fuel_this_month_litres = (
            FuelTransaction.objects.filter(
                transaction_date__year=previous_month.year,
                transaction_date__month=previous_month.month,
                is_active=True,
            )
            .aggregate(total=Sum("litres"))["total"]
            or Decimal("0.00")
        )

        active_vehicles = Vehicle.objects.filter(status=VehicleStatus.ACTIVE, is_active=True).count()
        previous_active_vehicles = active_vehicles
        overdue_maintenance = MaintenanceSchedule.objects.filter(
            status=MaintenanceSchedule.ScheduleStatus.OVERDUE,
            is_active=True,
        ).count()
        previous_overdue_maintenance = overdue_maintenance
        pending_requisitions = Requisition.objects.filter(
            status=Requisition.RequisitionStatus.PENDING_APPROVAL,
            is_active=True,
        ).count()
        previous_pending_requisitions = pending_requisitions

        payload = {
            "total_inventory_items": total_inventory_items,
            "previous_total_inventory_items": previous_total_inventory_items,
            "low_stock_items": low_stock_items,
            "previous_low_stock_items": previous_low_stock_items,
            "trips_today": trips_today,
            "previous_trips_today": previous_trips_today,
            "trips_this_week": trips_this_week,
            "previous_trips_this_week": previous_trips_this_week,
            "fuel_today_litres": fuel_today_litres,
            "previous_fuel_today_litres": previous_fuel_today_litres,
            "fuel_this_month_litres": fuel_this_month_litres,
            "previous_fuel_this_month_litres": previous_fuel_this_month_litres,
            "active_vehicles": active_vehicles,
            "previous_active_vehicles": previous_active_vehicles,
            "overdue_maintenance": overdue_maintenance,
            "previous_overdue_maintenance": previous_overdue_maintenance,
            "pending_requisitions": pending_requisitions,
            "previous_pending_requisitions": previous_pending_requisitions,
            "alerts": [
                {
                    "type": "warning",
                    "title": "Low stock items",
                    "count": low_stock_items,
                    "url": "/stores?view=low-stock",
                },
                {
                    "type": "danger",
                    "title": "Overdue maintenance",
                    "count": overdue_maintenance,
                    "url": "/maintenance",
                },
                {
                    "type": "warning",
                    "title": "Pending requisitions",
                    "count": pending_requisitions,
                    "url": "/stores/requisitions",
                },
            ],
        }

        serializer = DashboardSummarySerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        return self.success_response(serializer.validated_data)
