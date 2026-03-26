from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.users.models import Role
from apps.vehicles.models import Vehicle, VehicleOwnership, VehicleType

User = get_user_model()


class VehicleAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Fleet Manager",
            code="fleet-manager",
            permissions=[
                RolePermissionCodes.VIEW_VEHICLES,
                RolePermissionCodes.MANAGE_VEHICLES,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Fleet Viewer",
            code="fleet-viewer",
            permissions=[RolePermissionCodes.VIEW_VEHICLES],
        )
        self.manager = User.objects.create_user(
            username="fleet-admin",
            email="fleet-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="fleet-viewer",
            email="fleet-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.vehicle_type = VehicleType.objects.create(
            name="Tipper",
            code="tipper",
            default_capacity_tonnes="28.00",
            axle_count=4,
        )
        self.ownership = VehicleOwnership.objects.create(
            name="SEMKO Fleet",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            contact_person="Fleet Office",
            phone_number="0700000000",
            effective_from=date(2026, 1, 1),
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_update_list_and_deactivate_vehicle(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA123A",
                "fleet_number": "FLT-001",
                "vehicle_type_id": self.vehicle_type.id,
                "ownership_id": self.ownership.id,
                "make": "Isuzu",
                "model": "FVZ",
                "year": 2024,
                "chassis_number": "CHASSIS-001",
                "engine_number": "ENGINE-001",
                "color": "White",
                "capacity_tonnes": "28.00",
                "status": "active",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        vehicle_id = create_response.data["id"]

        list_response = self.client.get(
            reverse("vehicle-list-create"),
            {"search": "KDA123A"},
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            reverse("vehicle-detail", kwargs={"pk": vehicle_id}),
            {"status": "maintenance", "notes": "Scheduled service"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["status"], "maintenance")

        delete_response = self.client.delete(
            reverse("vehicle-detail", kwargs={"pk": vehicle_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        vehicle = Vehicle.objects.get(pk=vehicle_id)
        self.assertFalse(vehicle.is_active)
        self.assertEqual(vehicle.status, Vehicle.Status.INACTIVE)

    def test_viewer_can_list_but_cannot_create_vehicle(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("vehicle-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA124A",
                "fleet_number": "FLT-002",
                "vehicle_type_id": self.vehicle_type.id,
                "ownership_id": self.ownership.id,
                "make": "Mercedes",
                "year": 2025,
                "chassis_number": "CHASSIS-002",
                "capacity_tonnes": "30.00",
                "status": "active",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_manage_vehicle_types_and_ownerships(self):
        self.authenticate(self.manager)

        type_response = self.client.post(
            reverse("vehicle-type-list-create"),
            {
                "name": "Trailer",
                "code": "trailer",
                "description": "Long-haul trailer",
                "default_capacity_tonnes": "34.50",
                "axle_count": 6,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(type_response.status_code, status.HTTP_201_CREATED)

        ownership_response = self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "name": "Third Party Hauliers",
                "ownership_type": "hired",
                "contact_person": "Partner Desk",
                "phone_number": "0712345678",
                "effective_from": "2026-03-01",
                "notes": "Approved transport partners",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(ownership_response.status_code, status.HTTP_201_CREATED)

    def test_vehicle_filters_work_for_status_and_ownership_type(self):
        Vehicle.objects.create(
            registration_number="KDA125A",
            fleet_number="FLT-003",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Scania",
            model="P410",
            year=2023,
            chassis_number="CHASSIS-003",
            capacity_tonnes="32.00",
            status=Vehicle.Status.ACTIVE,
            is_active=True,
        )
        Vehicle.objects.create(
            registration_number="KDA126A",
            fleet_number="FLT-004",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Volvo",
            model="FMX",
            year=2022,
            chassis_number="CHASSIS-004",
            capacity_tonnes="30.00",
            status=Vehicle.Status.MAINTENANCE,
            is_active=True,
        )
        self.authenticate(self.viewer)

        response = self.client.get(
            reverse("vehicle-list-create"),
            {"status": Vehicle.Status.MAINTENANCE},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["registration_number"], "KDA126A")
