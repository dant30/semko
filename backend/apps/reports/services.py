import csv
from io import StringIO

from django.shortcuts import get_object_or_404

from apps.payroll.models import PayrollPeriod


def get_payroll_period_report_data(payroll_period_id):
    payroll_period = get_object_or_404(
        PayrollPeriod.objects.prefetch_related("payslips__bonus_earnings", "payslips__deductions"),
        pk=payroll_period_id,
    )
    payslips = list(
        payroll_period.payslips.select_related("driver").order_by(
            "driver__first_name",
            "driver__last_name",
        )
    )
    return {
        "payroll_period": payroll_period.name,
        "status": payroll_period.status,
        "driver_count": len(payslips),
        "delivered_trip_count": sum(item.delivered_trip_count for item in payslips),
        "verified_trip_count": sum(item.verified_trip_count for item in payslips),
        "gross_trip_revenue": sum(item.gross_trip_revenue for item in payslips),
        "gross_bonus_earnings": sum(item.gross_bonus_earnings for item in payslips),
        "gross_non_trip_earnings": sum(item.gross_non_trip_earnings for item in payslips),
        "gross_policy_earnings": sum(item.gross_policy_earnings for item in payslips),
        "trip_deduction_total": sum(item.trip_deduction_total for item in payslips),
        "policy_deduction_total": sum(item.policy_deduction_total for item in payslips),
        "statutory_deduction_total": sum(item.statutory_deduction_total for item in payslips),
        "total_deductions": sum(item.total_deductions for item in payslips),
        "net_trip_pay": sum(item.net_trip_pay for item in payslips),
        "total_cess_reference": sum(item.total_cess_reference for item in payslips),
        "total_hired_owner_settlement": sum(item.total_hired_owner_settlement for item in payslips),
        "payslips": payslips,
    }


def build_payroll_period_csv(summary):
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Driver",
            "Delivered Trips",
            "Verified Trips",
            "Gross Trip Revenue",
            "Gross Bonus Earnings",
            "Gross Non Trip Earnings",
            "Gross Policy Earnings",
            "Trip Deductions",
            "Policy Deductions",
            "Statutory Deductions",
            "Total Deductions",
            "Net Payable",
        ]
    )
    for payslip in summary["payslips"]:
        writer.writerow(
            [
                payslip.driver.full_name,
                payslip.delivered_trip_count,
                payslip.verified_trip_count,
                payslip.gross_trip_revenue,
                payslip.gross_bonus_earnings,
                payslip.gross_non_trip_earnings,
                payslip.gross_policy_earnings,
                payslip.trip_deduction_total,
                payslip.policy_deduction_total,
                payslip.statutory_deduction_total,
                payslip.total_deductions,
                payslip.net_trip_pay,
            ]
        )
    return buffer.getvalue()
