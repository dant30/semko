from rest_framework import serializers


class PayrollPeriodSummarySerializer(serializers.Serializer):
    payroll_period = serializers.CharField()
    status = serializers.CharField()
    driver_count = serializers.IntegerField()
    delivered_trip_count = serializers.IntegerField()
    verified_trip_count = serializers.IntegerField()
    gross_trip_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    gross_bonus_earnings = serializers.DecimalField(max_digits=14, decimal_places=2)
    gross_non_trip_earnings = serializers.DecimalField(max_digits=14, decimal_places=2)
    gross_policy_earnings = serializers.DecimalField(max_digits=14, decimal_places=2)
    trip_deduction_total = serializers.DecimalField(max_digits=14, decimal_places=2)
    policy_deduction_total = serializers.DecimalField(max_digits=14, decimal_places=2)
    statutory_deduction_total = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=14, decimal_places=2)
    net_trip_pay = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_cess_reference = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_hired_owner_settlement = serializers.DecimalField(max_digits=14, decimal_places=2)
