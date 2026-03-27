from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.users.models import Role, User, TokenBlacklist


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


@admin.register(TokenBlacklist)
class TokenBlacklistAdmin(admin.ModelAdmin):
    list_display = ("user", "token_type", "reason", "blacklisted_at", "expires_at")
    list_filter = ("token_type", "reason", "blacklisted_at")
    search_fields = ("user__username", "token")
    readonly_fields = ("token", "blacklisted_at")
    date_hierarchy = "blacklisted_at"

    def has_add_permission(self, request):
        """Prevent manual addition; use LogoutAPIView instead."""
        return False

    def has_change_permission(self, request, obj=None):
        """Prevent editing; blacklisted tokens are immutable."""
        return False

