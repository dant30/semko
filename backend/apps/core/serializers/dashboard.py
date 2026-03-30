from rest_framework import serializers


class DashboardAlertSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["info", "success", "warning", "danger"])
    title = serializers.CharField()
    count = serializers.IntegerField()
    url = serializers.CharField()


class DashboardSummarySerializer(serializers.Serializer):
    total_inventory_items = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    trips_today = serializers.IntegerField()
    trips_this_week = serializers.IntegerField()
    fuel_today_litres = serializers.DecimalField(max_digits=14, decimal_places=2)
    fuel_this_month_litres = serializers.DecimalField(max_digits=14, decimal_places=2)
    active_vehicles = serializers.IntegerField()
    overdue_maintenance = serializers.IntegerField()
    pending_requisitions = serializers.IntegerField()
    alerts = DashboardAlertSerializer(many=True)
