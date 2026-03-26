from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver
from apps.payroll.models import PayrollPeriod, Payslip
from apps.users.models import Role

User = get_user_model()


class PayrollReportsAPITests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name="Payroll Reporter",
            code="payroll-reporter",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.user = User.objects.create_user(
            username="payroll-report-user",
            email="payroll-report@example.com",
            password="S3curePass123",
            role=self.role,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-REPORT-01",
            first_name="Ruth",
            last_name="Reporter",
            national_id="99887766",
            phone_number="0712345678",
            date_of_birth="1992-01-01",
            hire_date="2021-01-01",
            employment_status=Driver.EmploymentStatus.ACTIVE,
            is_active=True,
        )
        self.period = PayrollPeriod.objects.create(
            name="Payroll Report March 2026",
            start_date="2026-03-01",
            end_date="2026-03-31",
            status=PayrollPeriod.Status.COMPLETED,
        )
        Payslip.objects.create(
            payroll_period=self.period,
            driver=self.driver,
            delivered_trip_count=3,
            verified_trip_count=2,
            gross_trip_revenue="7500.00",
            gross_bonus_earnings="1000.00",
            gross_non_trip_earnings="2000.00",
            gross_policy_earnings="1000.00",
            trip_deduction_total="250.00",
            policy_deduction_total="100.00",
            statutory_deduction_total="50.00",
            total_deductions="400.00",
            net_trip_pay="600.00",
            total_cess_reference="300.00",
            total_hired_owner_settlement="0.00",
        )

    def authenticate(self):
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_payroll_period_summary_endpoint_returns_aggregates(self):
        self.authenticate()

        response = self.client.get(
            reverse("report-payroll-period-summary", kwargs={"pk": self.period.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["driver_count"], 1)
        self.assertEqual(str(response.data["gross_bonus_earnings"]), "1000.00")
        self.assertEqual(str(response.data["gross_non_trip_earnings"]), "2000.00")
        self.assertEqual(str(response.data["total_deductions"]), "400.00")

    def test_payroll_period_export_endpoint_returns_csv(self):
        self.authenticate()

        response = self.client.get(
            reverse("report-payroll-period-export", kwargs={"pk": self.period.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn("Driver,Delivered Trips,Verified Trips", response.content.decode("utf-8"))
