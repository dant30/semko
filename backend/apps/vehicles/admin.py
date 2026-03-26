from django.contrib import admin

from apps.vehicles.models import Vehicle, VehicleOwnership, VehicleType


@admin.register(VehicleType)
class VehicleTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "default_capacity_tonnes", "axle_count", "is_active")
    list_filter = ("is_active", "axle_count")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(VehicleOwnership)
class VehicleOwnershipAdmin(admin.ModelAdmin):
    list_display = ("name", "ownership_type", "contact_person", "phone_number", "is_active")
    list_filter = ("ownership_type", "is_active")
    search_fields = ("name", "contact_person", "phone_number", "contract_reference")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "registration_number",
        "fleet_number",
        "vehicle_type",
        "ownership",
        "make",
        "capacity_tonnes",
        "status",
        "is_active",
    )
    list_filter = ("status", "is_active", "vehicle_type", "ownership__ownership_type")
    search_fields = ("registration_number", "fleet_number", "make", "model", "chassis_number")
    readonly_fields = ("created_at", "updated_at")
