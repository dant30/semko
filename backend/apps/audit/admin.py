from django.contrib import admin

from apps.audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "path", "method", "status_code", "actor")
    search_fields = ("path", "actor__username", "user_agent")
    list_filter = ("action", "method", "status_code", "created_at")
    readonly_fields = (
        "request_id",
        "actor",
        "action",
        "method",
        "path",
        "status_code",
        "ip_address",
        "user_agent",
        "metadata",
        "created_at",
    )
