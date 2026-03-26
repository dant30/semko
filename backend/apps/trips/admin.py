from django.contrib import admin

from apps.trips.models import Discrepancy, HiredTrip, Trip, WeighbridgeReading


class WeighbridgeReadingInline(admin.StackedInline):
    model = WeighbridgeReading
    extra = 0


class DiscrepancyInline(admin.StackedInline):
    model = Discrepancy
    extra = 0


class HiredTripInline(admin.StackedInline):
    model = HiredTrip
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = (
        "trip_number",
        "trip_date",
        "vehicle",
        "driver",
        "client",
        "material",
        "trip_type",
        "status",
        "is_active",
    )
    list_filter = ("trip_type", "status", "trip_date", "is_active")
    search_fields = ("trip_number", "delivery_note_number", "destination")
    readonly_fields = ("created_at", "updated_at")
    inlines = [WeighbridgeReadingInline, DiscrepancyInline, HiredTripInline]
