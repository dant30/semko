from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.clients.models import Client, Quarry
from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver, DriverLicense
from apps.materials.models import Material
from apps.notifications.models import Notification, NotificationPreference, NotificationTemplate
from apps.payroll.models import DriverCompensationProfile, DriverPayrollItem, PayrollPeriod, PayrollActionLog
from apps.rules.models import DeductionRule, StatutoryRate, TripClassificationRule
from apps.trips.models import Discrepancy, Trip, WeighbridgeReading
from apps.users.models import Role
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.models.vehicle_type import VehicleType
from apps.vehicles.constants import VehicleStatus

User = get_user_model()


class PayrollAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Payroll Manager",
            code="payroll-manager",
            permissions=[
                RolePermissionCodes.VIEW_PAYROLL,
                RolePermissionCodes.MANAGE_PAYROLL,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Payroll Viewer",
            code="payroll-viewer",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.manager = User.objects.create_user(
            username="payroll-admin",
            email="payroll-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="payroll-viewer",
            email="payroll-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.finance_role = Role.objects.create(
            name="Finance Officer",
            code="finance-officer",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.finance_user = User.objects.create_user(
            username="finance-user",
            email="finance@example.com",
            password="S3curePass123",
            role=self.finance_role,
        )
        self.hr_role = Role.objects.create(
            name="HR Officer",
            code="hr-officer",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.hr_user = User.objects.create_user(
            username="hr-user",
            email="hr@example.com",
            password="S3curePass123",
            role=self.hr_role,
        )
        self.operations_role = Role.objects.create(
            name="Operations Controller",
            code="operations-controller",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.operations_user = User.objects.create_user(
            username="operations-user",
            email="operations@example.com",
            password="S3curePass123",
            role=self.operations_role,
        )
        self.driver_portal_role = Role.objects.create(
            name="Driver Portal",
            code="driver-portal",
            permissions=[RolePermissionCodes.VIEW_OWN_PAYSLIP],
        )
        self.driver_user = User.objects.create_user(
            username="driver-user",
            email="driver@example.com",
            password="S3curePass123",
            role=self.driver_portal_role,
        )
        self.other_driver_user = User.objects.create_user(
            username="other-driver-user",
            email="other-driver@example.com",
            password="S3curePass123",
            role=self.driver_portal_role,
        )
        NotificationPreference.objects.create(
            role=self.hr_role,
            channel=Notification.Channel.EMAIL,
            event_code="payroll.period_locked",
            is_enabled=False,
        )
        NotificationPreference.objects.create(
            role=self.operations_role,
            channel=Notification.Channel.IN_APP,
            event_code="payroll.period_locked",
            is_enabled=True,
        )
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.period_locked",
            audience="finance",
            channel=Notification.Channel.EMAIL,
            defaults={
                "title_template": "Finance Lock Notice: {payroll_period_name}",
                "body_template": "Finance email for {payroll_period_name}. Finalized: {finalized_payslip_count}",
                "is_active": True,
            },
        )
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.period_locked",
            audience="hr",
            channel=Notification.Channel.IN_APP,
            defaults={
                "title_template": "HR Lock Notice: {payroll_period_name}",
                "body_template": "HR review for {payroll_period_name}. Note: {lock_audit_note}",
                "is_active": True,
            },
        )
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.period_locked",
            audience="operations",
            channel=Notification.Channel.IN_APP,
            defaults={
                "title_template": "Operations Update: {payroll_period_name} locked",
                "body_template": "Operations summary for {payroll_period_name}",
                "is_active": True,
            },
        )
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.payslip_ready",
            audience="driver",
            channel=Notification.Channel.SMS,
            defaults={
                "title_template": "Payslip Ready",
                "body_template": "{driver_name}, your payslip for {payroll_period_name} is ready.",
                "is_active": True,
            },
        )

        self.vehicle_type = VehicleType.objects.create(
            name="Payroll Tipper",
            code="payroll-tipper",
            default_capacity_tonnes="28.00",
            axle_count=4,
        )
        self.ownership = VehicleOwnership.objects.create(
            name="Payroll Fleet",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            effective_from="2026-01-01",
        )
        self.vehicle = Vehicle.objects.create(
            registration_number="KDA999A",
            fleet_number="FLT-PAY-01",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Isuzu",
            model="Giga",
            year=2024,
            chassis_number="PAY-CHASSIS-001",
            capacity_tonnes="28.00",
            status=VehicleStatus.ACTIVE,
            is_active=True,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-PAY-01",
            user=self.driver_user,
            first_name="Paul",
            last_name="Payroll",
            national_id="55550001",
            phone_number="0713000000",
            date_of_birth="1990-01-01",
            hire_date="2020-01-01",
            employment_status=Driver.EmploymentStatus.ACTIVE,
            is_active=True,
        )
        DriverLicense.objects.create(
            driver=self.driver,
            license_number="LIC-PAY-001",
            license_class="BCE",
            issue_date="2020-01-01",
            expiry_date="2028-01-01",
            status=DriverLicense.LicenseStatus.VALID,
        )
        DriverCompensationProfile.objects.create(
            driver=self.driver,
            base_salary="10000.00",
            per_trip_allowance="200.00",
            communication_allowance="300.00",
            risk_allowance="100.00",
            effective_from="2026-01-01",
            is_active=True,
        )
        DriverPayrollItem.objects.create(
            driver=self.driver,
            item_type=DriverPayrollItem.ItemType.EARNING,
            recurrence=DriverPayrollItem.Recurrence.MONTHLY,
            description="Night shift top-up",
            amount="1000.00",
            effective_from="2026-01-01",
            is_active=True,
        )
        DriverPayrollItem.objects.create(
            driver=self.driver,
            item_type=DriverPayrollItem.ItemType.DEDUCTION,
            recurrence=DriverPayrollItem.Recurrence.MONTHLY,
            description="Salary advance recovery",
            amount="150.00",
            effective_from="2026-01-01",
            is_active=True,
        )
        self.client_record = Client.objects.create(
            name="Payroll Client",
            code="payroll-client",
            client_type=Client.ClientType.CORPORATE,
            phone_number="0700005678",
            is_active=True,
        )
        self.quarry = Quarry.objects.create(
            name="Payroll Quarry",
            code="payroll-quarry",
            client=self.client_record,
            county="Kajiado",
            is_active=True,
        )
        self.material = Material.objects.create(
            name="Payroll Material",
            code="payroll-material",
            category=Material.MaterialCategory.AGGREGATE,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )
        TripClassificationRule.objects.create(
            name="Urban Payroll Bonus",
            code="urban-payroll-bonus",
            classification_label="Urban Delivery",
            destination_keyword="kitengela",
            bonus_amount="500.00",
            priority=1,
            is_active=True,
        )
        StatutoryRate.objects.create(
            name="Housing Levy",
            code="housing-levy",
            statutory_type=StatutoryRate.StatutoryType.HOUSING_LEVY,
            calculation_method=StatutoryRate.CalculationMethod.PERCENTAGE,
            apply_on=StatutoryRate.ApplyOn.GROSS_POLICY,
            rate_value="10.00",
            minimum_amount="0.00",
            effective_from="2026-01-01",
            is_active=True,
        )
        DeductionRule.objects.create(
            name="Document Compliance Recovery",
            code="document-compliance-recovery",
            deduction_category=DeductionRule.DeductionCategory.DOCUMENT_NON_COMPLIANCE,
            calculation_method=DeductionRule.CalculationMethod.FIXED,
            apply_on=DeductionRule.ApplyOn.GROSS_POLICY,
            rate_value="50.00",
            minimum_verified_trips=1,
            require_verified_documents=True,
            effective_from="2026-01-01",
            priority=1,
            is_active=True,
        )
        self.trip = Trip.objects.create(
            trip_number="TRIP-PAY-001",
            delivery_note_number="DN-PAY-001",
            trip_date="2026-03-15",
            vehicle=self.vehicle,
            driver=self.driver,
            client=self.client_record,
            quarry=self.quarry,
            material=self.material,
            destination="Kitengela Main Site",
            classification_label="Urban Delivery",
            trip_type=Trip.TripType.OWNED,
            quantity_unit="tonne",
            expected_quantity="28.00",
            agreed_unit_price="2500.00",
            status=Trip.Status.DELIVERED,
            documents_verified=True,
            is_active=True,
        )
        WeighbridgeReading.objects.create(
            trip=self.trip,
            quarry_gross_weight="42.00",
            quarry_tare_weight="14.00",
            quarry_net_weight="28.00",
            site_gross_weight="41.00",
            site_tare_weight="14.00",
            site_net_weight="27.00",
        )
        Discrepancy.objects.create(
            trip=self.trip,
            weight_difference="1.00",
            percentage_difference="3.57",
            tolerance_percentage="2.50",
            penalty_amount="2500.00",
            within_tolerance=False,
        )
        self.payroll_period = PayrollPeriod.objects.create(
            name="March 2026",
            start_date="2026-03-01",
            end_date="2026-03-31",
            status=PayrollPeriod.Status.DRAFT,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_generate_payslips_from_trips(self):
        self.authenticate(self.manager)

        response = self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)
        payslip = response.data[0]
        self.assertEqual(payslip["verified_trip_count"], 1)
        self.assertEqual(payslip["gross_bonus_earnings"], "500.00")
        self.assertEqual(payslip["gross_non_trip_earnings"], "11600.00")
        self.assertEqual(payslip["gross_policy_earnings"], "12100.00")
        self.assertEqual(payslip["trip_deduction_total"], "2500.00")
        self.assertEqual(payslip["policy_deduction_total"], "200.00")
        self.assertEqual(payslip["statutory_deduction_total"], "1210.00")
        self.assertEqual(payslip["total_deductions"], "3910.00")
        self.assertEqual(payslip["net_trip_pay"], "8190.00")

    def test_viewer_can_list_payslips_but_cannot_generate(self):
        self.authenticate(self.viewer)

        response = self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_approve_and_lock_completed_payroll_period(self):
        self.authenticate(self.manager)

        generate_response = self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.assertEqual(generate_response.status_code, status.HTTP_201_CREATED)

        approve_response = self.client.post(
            reverse("payroll-period-approve", kwargs={"pk": self.payroll_period.id}),
            {"comment": "Finance reviewed and approved figures."},
            format="json",
        )
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        self.assertEqual(approve_response.data["status"], PayrollPeriod.Status.APPROVED)
        self.assertEqual(
            approve_response.data["approval_comment"],
            "Finance reviewed and approved figures.",
        )

        lock_response = self.client.post(
            reverse("payroll-period-lock", kwargs={"pk": self.payroll_period.id}),
            {"note": "Locked after HR confirmation and final payslip generation."},
            format="json",
        )
        self.assertEqual(lock_response.status_code, status.HTTP_200_OK)
        self.assertEqual(lock_response.data["status"], PayrollPeriod.Status.LOCKED)
        self.assertEqual(
            lock_response.data["lock_audit_note"],
            "Locked after HR confirmation and final payslip generation.",
        )

        self.payroll_period.refresh_from_db()
        payslip = self.payroll_period.payslips.get(driver=self.driver)
        self.assertTrue(bool(payslip.finalized_document))
        self.assertIsNotNone(payslip.finalized_at)
        self.assertEqual(payslip.finalized_by, self.manager)
        self.assertEqual(
            self.payroll_period.action_logs.filter(action=PayrollActionLog.Action.APPROVED).count(),
            1,
        )
        self.assertEqual(
            self.payroll_period.action_logs.filter(action=PayrollActionLog.Action.LOCKED).count(),
            1,
        )
        self.assertEqual(
            self.payroll_period.action_logs.filter(action=PayrollActionLog.Action.FINALIZED).count(),
            1,
        )
        self.assertGreaterEqual(
            Notification.objects.filter(category=Notification.Category.PAYROLL).count(),
            2,
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.finance_user,
                title__icontains="Finance Lock Notice",
                channel=Notification.Channel.EMAIL,
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.hr_user,
                title__icontains="HR Lock Notice",
                channel=Notification.Channel.IN_APP,
            ).exists()
        )
        self.assertFalse(
            Notification.objects.filter(
                recipient=self.hr_user,
                channel=Notification.Channel.EMAIL,
                event_code="payroll.period_locked",
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.operations_user,
                title__icontains="Operations Update",
                channel=Notification.Channel.IN_APP,
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.driver_user,
                title__icontains="Payslip Ready",
                channel=Notification.Channel.SMS,
            ).exists()
        )

    def test_manager_can_view_payroll_action_logs(self):
        self.authenticate(self.manager)
        self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.client.post(
            reverse("payroll-period-approve", kwargs={"pk": self.payroll_period.id}),
            {"comment": "Approved by finance."},
            format="json",
        )

        response = self.client.get(
            reverse("payroll-period-action-log-list", kwargs={"pk": self.payroll_period.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["action"] == PayrollActionLog.Action.APPROVED for item in response.data))

    def test_locked_payroll_period_cannot_be_regenerated(self):
        self.authenticate(self.manager)

        self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.client.post(
            reverse("payroll-period-approve", kwargs={"pk": self.payroll_period.id}),
            {"comment": "Approved for lock."},
            format="json",
        )
        self.client.post(
            reverse("payroll-period-lock", kwargs={"pk": self.payroll_period.id}),
            {"note": "Locking payroll to prevent further edits."},
            format="json",
        )

        regenerate_response = self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.assertEqual(regenerate_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_driver_can_view_and_download_only_own_finalized_payslip(self):
        self.authenticate(self.manager)
        self.client.post(
            reverse("payroll-generate-from-trips", kwargs={"pk": self.payroll_period.id}),
            format="json",
        )
        self.client.post(
            reverse("payroll-period-approve", kwargs={"pk": self.payroll_period.id}),
            {"comment": "Approved for driver release."},
            format="json",
        )
        self.client.post(
            reverse("payroll-period-lock", kwargs={"pk": self.payroll_period.id}),
            {"note": "Payslips finalized."},
            format="json",
        )
        payslip = self.payroll_period.payslips.get(driver=self.driver)

        self.authenticate(self.driver_user)
        list_response = self.client.get(reverse("payslip-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["id"], payslip.id)

        detail_response = self.client.get(
            reverse("payslip-detail", kwargs={"pk": payslip.id})
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

        download_response = self.client.get(
            reverse("payslip-download", kwargs={"pk": payslip.id})
        )
        self.assertEqual(download_response.status_code, status.HTTP_200_OK)

        self.authenticate(self.other_driver_user)
        forbidden_detail = self.client.get(
            reverse("payslip-detail", kwargs={"pk": payslip.id})
        )
        self.assertEqual(forbidden_detail.status_code, status.HTTP_403_FORBIDDEN)

        forbidden_download = self.client.get(
            reverse("payslip-download", kwargs={"pk": payslip.id})
        )
        self.assertEqual(forbidden_download.status_code, status.HTTP_403_FORBIDDEN)

    def test_payroll_period_crud_is_available_to_manager(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("payroll-period-list-create"),
            {
                "name": "April 2026",
                "start_date": "2026-04-01",
                "end_date": "2026-04-30",
                "status": "draft",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
