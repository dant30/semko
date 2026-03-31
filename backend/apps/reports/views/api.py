from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.reports.serializers import PayrollPeriodSummarySerializer
from apps.reports.services import build_payroll_period_csv, get_payroll_period_report_data


class PayrollPeriodSummaryAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
    }

    def get(self, request, pk):
        summary = get_payroll_period_report_data(pk)
        serializer = PayrollPeriodSummarySerializer(summary)
        return Response(serializer.data)


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
