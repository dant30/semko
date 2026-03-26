from django.urls import path

from apps.payroll.views.api import (
    ApprovePayrollPeriodAPIView,
    DriverCompensationProfileDetailAPIView,
    DriverCompensationProfileListCreateAPIView,
    DriverPayrollItemDetailAPIView,
    DriverPayrollItemListCreateAPIView,
    FinalizedPayslipDownloadAPIView,
    GeneratePayrollFromTripsAPIView,
    LockPayrollPeriodAPIView,
    PayrollActionLogListAPIView,
    PayrollPeriodDetailAPIView,
    PayrollPeriodListCreateAPIView,
    PayslipDetailAPIView,
    PayslipListAPIView,
)

urlpatterns = [
    path("periods/", PayrollPeriodListCreateAPIView.as_view(), name="payroll-period-list-create"),
    path("periods/<int:pk>/", PayrollPeriodDetailAPIView.as_view(), name="payroll-period-detail"),
    path("periods/<int:pk>/generate/", GeneratePayrollFromTripsAPIView.as_view(), name="payroll-generate-from-trips"),
    path("periods/<int:pk>/approve/", ApprovePayrollPeriodAPIView.as_view(), name="payroll-period-approve"),
    path("periods/<int:pk>/lock/", LockPayrollPeriodAPIView.as_view(), name="payroll-period-lock"),
    path("periods/<int:pk>/logs/", PayrollActionLogListAPIView.as_view(), name="payroll-period-action-log-list"),
    path(
        "compensation-profiles/",
        DriverCompensationProfileListCreateAPIView.as_view(),
        name="driver-compensation-profile-list-create",
    ),
    path(
        "compensation-profiles/<int:pk>/",
        DriverCompensationProfileDetailAPIView.as_view(),
        name="driver-compensation-profile-detail",
    ),
    path("items/", DriverPayrollItemListCreateAPIView.as_view(), name="driver-payroll-item-list-create"),
    path("items/<int:pk>/", DriverPayrollItemDetailAPIView.as_view(), name="driver-payroll-item-detail"),
    path("payslips/", PayslipListAPIView.as_view(), name="payslip-list"),
    path("payslips/<int:pk>/", PayslipDetailAPIView.as_view(), name="payslip-detail"),
    path("payslips/<int:pk>/download/", FinalizedPayslipDownloadAPIView.as_view(), name="payslip-download"),
]
