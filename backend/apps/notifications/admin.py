from django.contrib import admin

from apps.notifications.models import (
    Notification,
    NotificationLog,
    NotificationPreference,
    NotificationTemplate,
)


class NotificationLogInline(admin.TabularInline):
    model = NotificationLog
    extra = 0
    readonly_fields = ("status", "channel", "detail", "created_at", "updated_at")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "recipient", "category", "channel", "audience", "is_read", "created_at")
    list_filter = ("category", "channel", "audience", "is_read")
    search_fields = ("title", "recipient__username", "recipient__email")
    readonly_fields = ("created_at", "updated_at")
    inlines = [NotificationLogInline]


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("event_code", "audience", "channel", "is_active")
    list_filter = ("audience", "channel", "is_active")
    search_fields = ("event_code", "title_template", "body_template")
    readonly_fields = ("created_at", "updated_at")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "channel", "category", "event_code", "is_enabled")
    list_filter = ("channel", "is_enabled", "category")
    search_fields = ("user__username", "role__name", "event_code", "category")
    readonly_fields = ("created_at", "updated_at")
