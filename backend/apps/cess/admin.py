from django.contrib import admin

from apps.cess.models import CessRate, CessReceipt, CessTransaction


class CessReceiptInline(admin.StackedInline):
    model = CessReceipt
    extra = 0


@admin.register(CessRate)
class CessRateAdmin(admin.ModelAdmin):
    list_display = ("name", "county", "material", "rate_type", "amount", "is_active")
    list_filter = ("county", "rate_type", "is_active")
    search_fields = ("name", "code", "county", "material__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(CessTransaction)
class CessTransactionAdmin(admin.ModelAdmin):
    list_display = ("trip", "county", "quantity", "amount", "status")
    list_filter = ("status", "county")
    search_fields = ("trip__trip_number", "county")
    readonly_fields = ("created_at", "updated_at")
    inlines = [CessReceiptInline]
