from django.http import FileResponse
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import (
    HasRolePermissions,
    IsAuthenticatedAndActive,
    user_has_role_permission,
)
from apps.payroll.models import DriverCompensationProfile, DriverPayrollItem, PayrollPeriod, Payslip
from apps.payroll.serializers import (
    DriverCompensationProfileSerializer,
    DriverPayrollItemSerializer,
    PayrollActionLogSerializer,
    PayrollPeriodSerializer,
    PayslipSerializer,
)
from apps.payroll.services import (
    approve_payroll_period,
    generate_payslips_for_period,
    lock_payroll_period,
)


def _user_can_view_payslip(user, payslip):
    if not user or not user.is_authenticated or not user.is_active:
        return False
    if user_has_role_permission(user, RolePermissionCodes.VIEW_PAYROLL):
        return True
    return (
        user_has_role_permission(user, RolePermissionCodes.VIEW_OWN_PAYSLIP)
        and getattr(payslip.driver, "user_id", None) == user.id
    )


class PayrollPeriodListCreateAPIView(generics.ListCreateAPIView):
    queryset = PayrollPeriod.objects.order_by("-start_date")
    serializer_class = PayrollPeriodSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }


class PayrollPeriodDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PayrollPeriod.objects.order_by("-start_date")
    serializer_class = PayrollPeriodSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "PUT": [RolePermissionCodes.MANAGE_PAYROLL],
        "PATCH": [RolePermissionCodes.MANAGE_PAYROLL],
        "DELETE": [RolePermissionCodes.MANAGE_PAYROLL],
    }

    def update(self, request, *args, **kwargs):
        payroll_period = self.get_object()
        if payroll_period.status in (
            PayrollPeriod.Status.APPROVED,
            PayrollPeriod.Status.LOCKED,
        ):
            return Response(
                {"detail": "Approved or locked payroll periods cannot be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        payroll_period = self.get_object()
        if payroll_period.status in (
            PayrollPeriod.Status.APPROVED,
            PayrollPeriod.Status.LOCKED,
        ):
            return Response(
                {"detail": "Approved or locked payroll periods cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class DriverCompensationProfileListCreateAPIView(generics.ListCreateAPIView):
    queryset = DriverCompensationProfile.objects.select_related("driver").order_by("driver__first_name")
    serializer_class = DriverCompensationProfileSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }


class DriverCompensationProfileDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DriverCompensationProfile.objects.select_related("driver").order_by("driver__first_name")
    serializer_class = DriverCompensationProfileSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "PUT": [RolePermissionCodes.MANAGE_PAYROLL],
        "PATCH": [RolePermissionCodes.MANAGE_PAYROLL],
        "DELETE": [RolePermissionCodes.MANAGE_PAYROLL],
    }


class DriverPayrollItemListCreateAPIView(generics.ListCreateAPIView):
    queryset = DriverPayrollItem.objects.select_related("driver").order_by("driver__first_name", "description")
    serializer_class = DriverPayrollItemSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }


class DriverPayrollItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DriverPayrollItem.objects.select_related("driver").order_by("driver__first_name", "description")
    serializer_class = DriverPayrollItemSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
        "PUT": [RolePermissionCodes.MANAGE_PAYROLL],
        "PATCH": [RolePermissionCodes.MANAGE_PAYROLL],
        "DELETE": [RolePermissionCodes.MANAGE_PAYROLL],
    }


class PayslipListAPIView(generics.ListAPIView):
    queryset = Payslip.objects.select_related("payroll_period", "driver").prefetch_related(
        "bonus_earnings",
        "deductions",
    )
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_queryset(self):
        queryset = super().get_queryset()
        if user_has_role_permission(self.request.user, RolePermissionCodes.VIEW_PAYROLL):
            return queryset
        if user_has_role_permission(self.request.user, RolePermissionCodes.VIEW_OWN_PAYSLIP):
            return queryset.filter(driver__user=self.request.user)
        return queryset.none()


class PayslipDetailAPIView(generics.RetrieveAPIView):
    queryset = Payslip.objects.select_related("payroll_period", "driver").prefetch_related(
        "bonus_earnings",
        "deductions",
    )
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticatedAndActive]

    def get_object(self):
        payslip = super().get_object()
        if not _user_can_view_payslip(self.request.user, payslip):
            raise PermissionDenied("You do not have permission to view this payslip.")
        return payslip


class FinalizedPayslipDownloadAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def get(self, request, pk):
        payslip = get_object_or_404(
            Payslip.objects.select_related("driver", "payroll_period"),
            pk=pk,
        )
        if not _user_can_view_payslip(request.user, payslip):
            raise PermissionDenied("You do not have permission to download this payslip.")
        if not payslip.finalized_document:
            return Response(
                {"detail": "This payslip has not been finalized yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return FileResponse(
            payslip.finalized_document.open("rb"),
            as_attachment=True,
            filename=payslip.finalized_document.name.split("/")[-1],
        )


class PayrollActionLogListAPIView(generics.ListAPIView):
    serializer_class = PayrollActionLogSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PAYROLL],
    }

    def get_queryset(self):
        payroll_period_id = self.kwargs["pk"]
        payroll_period = get_object_or_404(PayrollPeriod, pk=payroll_period_id)
        return payroll_period.action_logs.select_related(
            "actor",
            "payroll_period",
        )


class GeneratePayrollFromTripsAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }

    def post(self, request, pk):
        payroll_period = get_object_or_404(PayrollPeriod, pk=pk)
        try:
            generated = generate_payslips_for_period(payroll_period, generated_by=request.user)
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PayslipSerializer(generated, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApprovePayrollPeriodAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }

    def post(self, request, pk):
        payroll_period = get_object_or_404(PayrollPeriod, pk=pk)
        try:
            approve_payroll_period(
                payroll_period,
                request.user,
                comment=request.data.get("comment", "").strip(),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PayrollPeriodSerializer(payroll_period)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LockPayrollPeriodAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "POST": [RolePermissionCodes.MANAGE_PAYROLL],
    }

    def post(self, request, pk):
        payroll_period = get_object_or_404(PayrollPeriod, pk=pk)
        try:
            lock_payroll_period(
                payroll_period,
                request.user,
                note=request.data.get("note", "").strip(),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PayrollPeriodSerializer(payroll_period)
        return Response(serializer.data, status=status.HTTP_200_OK)
