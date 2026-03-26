from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.reports.services import build_payroll_period_csv, get_payroll_period_report_data


class PayrollPeriodSummaryAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
    }

    def get(self, request, pk):
        summary = get_payroll_period_report_data(pk)
        return Response(
            {
                "payroll_period": summary["payroll_period"],
                "status": summary["status"],
                "driver_count": summary["driver_count"],
                "delivered_trip_count": summary["delivered_trip_count"],
                "verified_trip_count": summary["verified_trip_count"],
                "gross_trip_revenue": summary["gross_trip_revenue"],
                "gross_bonus_earnings": summary["gross_bonus_earnings"],
                "gross_non_trip_earnings": summary["gross_non_trip_earnings"],
                "gross_policy_earnings": summary["gross_policy_earnings"],
                "trip_deduction_total": summary["trip_deduction_total"],
                "policy_deduction_total": summary["policy_deduction_total"],
                "statutory_deduction_total": summary["statutory_deduction_total"],
                "total_deductions": summary["total_deductions"],
                "net_trip_pay": summary["net_trip_pay"],
                "total_cess_reference": summary["total_cess_reference"],
                "total_hired_owner_settlement": summary["total_hired_owner_settlement"],
            }
        )


class PayrollPeriodExportAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
    }

    def get(self, request, pk):
        summary = get_payroll_period_report_data(pk)
        csv_content = build_payroll_period_csv(summary)
        response = HttpResponse(csv_content, content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="payroll-period-{pk}-summary.csv"'
        return response
