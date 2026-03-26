from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.users.models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_system", "created_at")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "role")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "SEMKO Access",
            {
                "fields": (
                    "phone_number",
                    "role",
                    "must_change_password",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("SEMKO Access", {"fields": ("email", "phone_number", "role")}),
    )
