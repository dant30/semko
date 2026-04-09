# backend/apps/vehicles/admin.py
from django.contrib import admin
from django.utils.html import format_html

from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.models.vehicle_type import VehicleType


class VehicleOwnershipInline(admin.StackedInline):
    model = VehicleOwnership
    extra = 0
    can_delete = False
    fields = (
        "ownership_type", "owner_name", "lease_start_date", "lease_end_date",
        "monthly_lease_cost", "registration_document_number", "insurance_provider",
        "insurance_policy_number", "insurance_expiry_date", "notes",
    )


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "registration_number", "make", "model", "year", "vehicle_type", "status",
        "current_mileage_km", "is_active", "is_available_badge"
    )
    list_filter = ("status", "fuel_type", "vehicle_type", "is_active", "year")
    list_editable = ("status", "is_active")
    search_fields = (
        "registration_number", "vin", "make", "model", "engine_number", "notes"
    )
    readonly_fields = ("created_at", "updated_at")
    inlines = [VehicleOwnershipInline]
    fieldsets = (
        ("Identification", {
            "fields": ("registration_number", "vin", "make", "model", "year", "color")
        }),
        ("Technical Specs", {
            "fields": ("vehicle_type", "fuel_type", "engine_number", "seating_capacity", "load_capacity_tonnes")
        }),
        ("Operational Status", {
            "fields": ("status", "current_mileage_km", "last_maintenance_date",
                       "next_maintenance_due_km", "next_maintenance_due_date", "is_active")
        }),
        ("Miscellaneous", {
            "fields": ("notes", "created_at", "updated_at")
        }),
    )

    def is_available_badge(self, obj):
        if obj.is_available:
            return format_html('<span style="color:green;">✓ Available</span>')
        return format_html('<span style="color:red;">✗ Not Available</span>')
    is_available_badge.short_description = "Availability"


@admin.register(VehicleType)
class VehicleTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "max_load_tonnes", "typical_fuel_consumption_l_per_100km", "is_active")
    list_editable = ("is_active",)
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(VehicleOwnership)
class VehicleOwnershipAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "ownership_type", "owner_name", "insurance_expiry_date")
    list_filter = ("ownership_type",)
    search_fields = ("vehicle__registration_number", "owner_name", "insurance_policy_number")
    readonly_fields = ("created_at", "updated_at")
