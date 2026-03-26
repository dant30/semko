from django.urls import path

from apps.reports.views.api import PayrollPeriodExportAPIView, PayrollPeriodSummaryAPIView

urlpatterns = [
    path(
        "payroll/periods/<int:pk>/summary/",
        PayrollPeriodSummaryAPIView.as_view(),
        name="report-payroll-period-summary",
    ),
    path(
        "payroll/periods/<int:pk>/export/",
        PayrollPeriodExportAPIView.as_view(),
        name="report-payroll-period-export",
    ),
]
