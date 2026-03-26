from django.contrib import admin

from apps.maintenance.models import Mechanic, MaintenanceSchedule, PartUsed, ServiceRecord


@admin.register(Mechanic)
class MechanicAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "employment_type", "specialization", "is_active")
    list_filter = ("employment_type", "is_active")
    search_fields = ("employee_id", "first_name", "last_name", "specialization")
    readonly_fields = ("created_at", "updated_at")


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "vehicle",
        "title",
        "maintenance_type",
        "next_due_date",
        "next_due_odometer",
        "status",
        "is_active",
    )
    list_filter = ("maintenance_type", "status", "is_active")
    search_fields = ("reference_no", "title", "vehicle__registration_number")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "vehicle",
        "mechanic",
        "service_date",
        "status",
        "total_parts_cost",
        "total_cost",
        "is_active",
    )
    list_filter = ("status", "is_active")
    search_fields = ("reference_no", "title", "vehicle__registration_number", "mechanic__employee_id")
    readonly_fields = ("created_at", "updated_at", "total_parts_cost", "total_cost")


@admin.register(PartUsed)
class PartUsedAdmin(admin.ModelAdmin):
    list_display = ("service_record", "item", "quantity", "unit_cost", "total_cost", "is_active")
    list_filter = ("is_active", "item__category")
    search_fields = ("service_record__reference_no", "item__name", "item__code")
    readonly_fields = ("created_at", "updated_at", "total_cost")
