from django.contrib import admin

from apps.rules.models import DeductionRule, PenaltyThresholdRule, StatutoryRate, TripClassificationRule


@admin.register(TripClassificationRule)
class TripClassificationRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "classification_label", "priority", "is_active")
    list_filter = ("is_active", "priority")
    search_fields = ("name", "code", "classification_label", "destination_keyword")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PenaltyThresholdRule)
class PenaltyThresholdRuleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "minimum_percentage",
        "maximum_percentage",
        "tolerance_percentage",
        "penalty_multiplier",
        "priority",
        "is_active",
    )
    list_filter = ("is_active", "priority")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StatutoryRate)
class StatutoryRateAdmin(admin.ModelAdmin):
    list_display = ("name", "statutory_type", "calculation_method", "rate_value", "effective_from", "is_active")
    list_filter = ("statutory_type", "calculation_method", "apply_on", "is_active")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DeductionRule)
class DeductionRuleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "deduction_category",
        "calculation_method",
        "rate_value",
        "minimum_verified_trips",
        "priority",
        "is_active",
    )
    list_filter = ("deduction_category", "calculation_method", "apply_on", "is_active")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")
