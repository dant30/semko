from django.contrib import admin

from apps.clients.models import Client, CorporateClientProfile, IndividualClientProfile, Quarry


class CorporateClientProfileInline(admin.StackedInline):
    model = CorporateClientProfile
    extra = 0


class IndividualClientProfileInline(admin.StackedInline):
    model = IndividualClientProfile
    extra = 0


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "client_type", "phone_number", "status", "is_active")
    list_filter = ("client_type", "status", "is_active", "county")
    search_fields = ("name", "code", "contact_person", "phone_number", "email")
    readonly_fields = ("created_at", "updated_at")

    def get_inlines(self, request, obj):
        return [CorporateClientProfileInline, IndividualClientProfileInline]


@admin.register(Quarry)
class QuarryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "client", "county", "contact_person", "is_active")
    list_filter = ("county", "is_active")
    search_fields = ("name", "code", "client__name", "contact_person")
    readonly_fields = ("created_at", "updated_at")
