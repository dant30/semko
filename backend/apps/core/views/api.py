from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from apps.core.mixins.api_mixins import StandardizedSuccessResponseMixin
from apps.core.serializers.dashboard import DashboardSummarySerializer
from apps.maintenance.models import MaintenanceSchedule
from apps.stores.models import Item, Requisition
from apps.trips.models import Trip
from apps.fuel.models import FuelTransaction
from apps.vehicles.models import Vehicle


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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        total_inventory_items = Item.objects.filter(is_active=True).count()
        low_stock_items = (
            Item.objects.with_stock_snapshot()
            .filter(is_active=True, is_below_reorder_level=True)
            .count()
        )

        trips_today = Trip.objects.filter(trip_date=today, is_active=True).count()
        trips_this_week = (
            Trip.objects.filter(
                trip_date__range=(week_start, week_end),
                is_active=True,
            )
            .count()
        )

        fuel_today_litres = (
            FuelTransaction.objects.filter(transaction_date=today, is_active=True)
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

        active_vehicles = Vehicle.objects.filter(status=Vehicle.Status.ACTIVE, is_active=True).count()
        overdue_maintenance = MaintenanceSchedule.objects.filter(
            status=MaintenanceSchedule.ScheduleStatus.OVERDUE,
            is_active=True,
        ).count()
        pending_requisitions = Requisition.objects.filter(
            status=Requisition.RequisitionStatus.PENDING_APPROVAL,
            is_active=True,
        ).count()

        payload = {
            "total_inventory_items": total_inventory_items,
            "low_stock_items": low_stock_items,
            "trips_today": trips_today,
            "trips_this_week": trips_this_week,
            "fuel_today_litres": fuel_today_litres,
            "fuel_this_month_litres": fuel_this_month_litres,
            "active_vehicles": active_vehicles,
            "overdue_maintenance": overdue_maintenance,
            "pending_requisitions": pending_requisitions,
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
