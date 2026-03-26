from django.contrib import admin

from apps.fuel.models import FuelConsumption, FuelStation, FuelTransaction


@admin.register(FuelStation)
class FuelStationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "station_type", "location", "is_active")
    list_filter = ("station_type", "is_active")
    search_fields = ("name", "code", "location", "contact_person")
    readonly_fields = ("created_at", "updated_at")


@admin.register(FuelTransaction)
class FuelTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "transaction_date",
        "vehicle",
        "station",
        "fuel_type",
        "litres",
        "total_cost",
        "is_active",
    )
    list_filter = ("fuel_type", "payment_method", "station__station_type", "is_active")
    search_fields = ("reference_no", "vehicle__registration_number", "station__name")
    readonly_fields = ("created_at", "updated_at", "total_cost")


@admin.register(FuelConsumption)
class FuelConsumptionAdmin(admin.ModelAdmin):
    list_display = (
        "vehicle",
        "period_start",
        "period_end",
        "distance_covered",
        "total_litres",
        "km_per_litre",
        "litres_per_100km",
        "is_active",
    )
    list_filter = ("is_active",)
    search_fields = ("vehicle__registration_number", "vehicle__fleet_number", "notes")
    readonly_fields = (
        "created_at",
        "updated_at",
        "distance_covered",
        "km_per_litre",
        "litres_per_100km",
    )
