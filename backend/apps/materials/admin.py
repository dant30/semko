from django.contrib import admin

from apps.materials.models import Material, MaterialPrice


class MaterialPriceInline(admin.TabularInline):
    model = MaterialPrice
    extra = 0


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "category", "unit_of_measure", "is_active")
    list_filter = ("category", "unit_of_measure", "is_active")
    search_fields = ("name", "code", "description")
    readonly_fields = ("created_at", "updated_at")
    inlines = [MaterialPriceInline]


@admin.register(MaterialPrice)
class MaterialPriceAdmin(admin.ModelAdmin):
    list_display = (
        "material",
        "price_per_unit",
        "currency",
        "effective_from",
        "effective_to",
        "is_active",
    )
    list_filter = ("currency", "is_active", "material__category")
    search_fields = ("material__name", "material__code", "notes")
    readonly_fields = ("created_at", "updated_at")
