from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver, DriverLicense
from apps.users.models import Role

User = get_user_model()


class DriverAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Operations Manager",
            code="operations-manager",
            permissions=[
                RolePermissionCodes.VIEW_DRIVERS,
                RolePermissionCodes.MANAGE_DRIVERS,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Operations Viewer",
            code="operations-viewer",
            permissions=[RolePermissionCodes.VIEW_DRIVERS],
        )
        self.manager = User.objects.create_user(
            username="driver-admin",
            email="driver-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="driver-viewer",
            email="driver-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_update_list_and_deactivate_driver(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("driver-list-create"),
            {
                "employee_id": "DRV-001",
                "first_name": "John",
                "last_name": "Kamau",
                "national_id": "12345678",
                "phone_number": "0712345678",
                "alternate_phone_number": "0799999999",
                "email": "john.kamau@example.com",
                "date_of_birth": "1990-05-12",
                "hire_date": "2022-01-15",
                "employment_status": "active",
                "emergency_contact_name": "Mary Kamau",
                "emergency_contact_phone": "0700000000",
                "address": "Nairobi",
                "notes": "Senior long-haul driver",
                "is_active": True,
                "license": {
                    "license_number": "DL-001",
                    "license_class": "BCE",
                    "issue_date": "2022-01-15",
                    "expiry_date": "2028-01-15",
                    "status": "valid",
                    "issuing_authority": "NTSA",
                    "restrictions": "",
                    "notes": "",
                },
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        driver_id = create_response.data["id"]

        list_response = self.client.get(reverse("driver-list-create"), {"search": "Kamau"})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            reverse("driver-detail", kwargs={"pk": driver_id}),
            {"employment_status": "on_leave", "notes": "Annual leave"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["employment_status"], "on_leave")

        license_id = Driver.objects.get(pk=driver_id).license.id
        license_response = self.client.patch(
            reverse("driver-license-detail", kwargs={"pk": license_id}),
            {"status": "suspended", "notes": "Under review"},
            format="json",
        )
        self.assertEqual(license_response.status_code, status.HTTP_200_OK)
        self.assertEqual(license_response.data["status"], "suspended")

        delete_response = self.client.delete(
            reverse("driver-detail", kwargs={"pk": driver_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        driver = Driver.objects.get(pk=driver_id)
        self.assertFalse(driver.is_active)
        self.assertEqual(driver.employment_status, Driver.EmploymentStatus.INACTIVE)

    def test_viewer_can_list_but_cannot_create_driver(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("driver-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("driver-list-create"),
            {
                "employee_id": "DRV-002",
                "first_name": "Jane",
                "last_name": "Wanjiku",
                "national_id": "87654321",
                "phone_number": "0700111222",
                "date_of_birth": "1992-08-10",
                "hire_date": "2023-02-01",
                "employment_status": "active",
                "is_active": True,
                "license": {
                    "license_number": "DL-002",
                    "license_class": "BCE",
                    "issue_date": "2023-02-01",
                    "expiry_date": "2029-02-01",
                    "status": "valid",
                },
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_driver_filters_work_for_status_and_license_status(self):
        driver_one = Driver.objects.create(
            employee_id="DRV-003",
            first_name="Peter",
            last_name="Otieno",
            national_id="11112222",
            phone_number="0711111111",
            date_of_birth="1988-01-01",
            hire_date="2020-01-01",
            employment_status=Driver.EmploymentStatus.ACTIVE,
            is_active=True,
        )
        DriverLicense.objects.create(
            driver=driver_one,
            license_number="DL-003",
            license_class="BCE",
            issue_date="2020-01-01",
            expiry_date="2027-01-01",
            status=DriverLicense.LicenseStatus.VALID,
        )
        driver_two = Driver.objects.create(
            employee_id="DRV-004",
            first_name="David",
            last_name="Mutua",
            national_id="33334444",
            phone_number="0722222222",
            date_of_birth="1987-02-01",
            hire_date="2019-03-01",
            employment_status=Driver.EmploymentStatus.SUSPENDED,
            is_active=True,
        )
        DriverLicense.objects.create(
            driver=driver_two,
            license_number="DL-004",
            license_class="BCE",
            issue_date="2019-03-01",
            expiry_date="2026-12-01",
            status=DriverLicense.LicenseStatus.SUSPENDED,
        )
        self.authenticate(self.viewer)

        response = self.client.get(
            reverse("driver-list-create"),
            {"license_status": DriverLicense.LicenseStatus.SUSPENDED},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["employee_id"], "DRV-004")
