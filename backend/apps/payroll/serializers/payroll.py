from rest_framework import serializers

from apps.payroll.models import (
    BonusEarning,
    Deduction,
    DriverCompensationProfile,
    DriverPayrollItem,
    PayrollActionLog,
    PayrollPeriod,
    Payslip,
)


class PayrollPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollPeriod
        fields = [
            "id",
            "name",
            "start_date",
            "end_date",
            "status",
            "notes",
            "approval_comment",
            "lock_audit_note",
            "approved_by",
            "approved_at",
            "locked_by",
            "locked_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "approved_by",
            "approved_at",
            "locked_by",
            "locked_at",
            "created_at",
            "updated_at",
        ]


class DriverCompensationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverCompensationProfile
        fields = [
            "id",
            "driver",
            "base_salary",
            "per_trip_allowance",
            "communication_allowance",
            "risk_allowance",
            "effective_from",
            "effective_to",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DriverPayrollItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverPayrollItem
        fields = [
            "id",
            "driver",
            "item_type",
            "recurrence",
            "description",
            "amount",
            "effective_from",
            "effective_to",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PayrollActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollActionLog
        fields = [
            "id",
            "payroll_period",
            "action",
            "actor",
            "comment",
            "metadata",
            "created_at",
        ]
        read_only_fields = fields


class BonusEarningSerializer(serializers.ModelSerializer):
    class Meta:
        model = BonusEarning
        fields = ["id", "trip", "bonus_type", "description", "amount", "created_at"]
        read_only_fields = ["id", "created_at"]


class DeductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deduction
        fields = ["id", "trip", "deduction_type", "description", "amount", "created_at"]
        read_only_fields = ["id", "created_at"]


class PayslipSerializer(serializers.ModelSerializer):
    bonus_earnings = BonusEarningSerializer(many=True, read_only=True)
    deductions = DeductionSerializer(many=True, read_only=True)

    class Meta:
        model = Payslip
        fields = [
            "id",
            "payroll_period",
            "driver",
            "delivered_trip_count",
            "verified_trip_count",
            "gross_trip_revenue",
            "gross_bonus_earnings",
            "gross_non_trip_earnings",
            "gross_policy_earnings",
            "trip_deduction_total",
            "policy_deduction_total",
            "statutory_deduction_total",
            "total_deductions",
            "net_trip_pay",
            "total_cess_reference",
            "total_hired_owner_settlement",
            "finalized_document",
            "finalized_at",
            "finalized_by",
            "bonus_earnings",
            "deductions",
            "created_at",
            "updated_at",
        ]
