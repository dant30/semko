# backend/apps/drivers/admin.py
from django.contrib import admin

from apps.drivers.models import Driver, DriverLicense


class DriverLicenseInline(admin.StackedInline):
    model = DriverLicense
    extra = 0


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id",
        "first_name",
        "last_name",
        "phone_number",
        "employment_status",
        "is_active",
    )
    list_filter = ("employment_status", "is_active")
    search_fields = ("employee_id", "first_name", "last_name", "national_id", "phone_number")
    readonly_fields = ("created_at", "updated_at")
    inlines = [DriverLicenseInline]


@admin.register(DriverLicense)
class DriverLicenseAdmin(admin.ModelAdmin):
    list_display = (
        "license_number",
        "driver",
        "license_class",
        "expiry_date",
        "status",
    )
    list_filter = ("status", "license_class")
    search_fields = ("license_number", "driver__first_name", "driver__last_name")
    readonly_fields = ("created_at", "updated_at")
