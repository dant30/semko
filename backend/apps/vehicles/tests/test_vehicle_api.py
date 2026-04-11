from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.users.models import Role
from apps.vehicles.constants import OwnershipType, VehicleStatus
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.vehicle_type import VehicleType

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
            max_load_tonnes="28.00",
            max_volume_cubic_meters="40.00",
            typical_fuel_consumption_l_per_100km="15.00",
            is_active=True,
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
                "vin": "VIN-001",
                "make": "Isuzu",
                "model": "FVZ",
                "year": 2024,
                "fuel_type": "diesel",
                "status": VehicleStatus.ACTIVE,
                "vehicle_type": self.vehicle_type.id,
                "current_mileage_km": 1000,
                "seating_capacity": 2,
                "load_capacity_tonnes": "28.00",
                "color": "White",
                "engine_number": "ENGINE-001",
                "last_maintenance_date": "2026-01-15",
                "next_maintenance_due_km": 20000,
                "next_maintenance_due_date": "2026-06-01",
                "notes": "New vehicle",
                "is_active": True,
                "ownership": {
                    "ownership_type": OwnershipType.COMPANY_OWNED,
                    "owner_name": "SEMKO Fleet",
                    "lease_start_date": "2026-01-01",
                    "lease_end_date": "2027-01-01",
                    "monthly_lease_cost": "0.00",
                    "registration_document_number": "REG-001",
                    "insurance_provider": "SEMKO Insurance",
                    "insurance_policy_number": "POL-001",
                    "insurance_expiry_date": "2027-01-01",
                    "notes": "Company owned",
                },
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
            {"status": VehicleStatus.UNDER_MAINTENANCE, "notes": "Scheduled service"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["status"], VehicleStatus.UNDER_MAINTENANCE)

        delete_response = self.client.delete(
            reverse("vehicle-detail", kwargs={"pk": vehicle_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        vehicle = Vehicle.objects.get(pk=vehicle_id)
        self.assertFalse(vehicle.is_active)
        self.assertEqual(vehicle.status, VehicleStatus.STANDBY)

    def test_viewer_can_list_but_cannot_create_vehicle(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("vehicle-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA124A",
                "vin": "VIN-002",
                "make": "Mercedes",
                "model": "Actros",
                "year": 2025,
                "fuel_type": "diesel",
                "status": VehicleStatus.ACTIVE,
                "vehicle_type": self.vehicle_type.id,
                "current_mileage_km": 0,
                "seating_capacity": 2,
                "load_capacity_tonnes": "30.00",
                "engine_number": "ENGINE-002",
                "notes": "New fleet",
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
                "max_load_tonnes": "34.50",
                "max_volume_cubic_meters": "60.00",
                "typical_fuel_consumption_l_per_100km": "24.00",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(type_response.status_code, status.HTTP_201_CREATED)

        vehicle_response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA125A",
                "vin": "VIN-003",
                "make": "Volvo",
                "model": "FMX",
                "year": 2023,
                "fuel_type": "diesel",
                "status": VehicleStatus.ACTIVE,
                "vehicle_type": self.vehicle_type.id,
                "current_mileage_km": 0,
                "seating_capacity": 2,
                "load_capacity_tonnes": "30.00",
                "color": "Yellow",
                "engine_number": "ENGINE-003",
                "notes": "Test asset",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(vehicle_response.status_code, status.HTTP_201_CREATED)
        vehicle_id = vehicle_response.data["id"]

        ownership_response = self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "vehicle_id": vehicle_id,
                "ownership_type": OwnershipType.COMPANY_OWNED,
                "owner_name": "SEMKO Fleet",
                "lease_start_date": "2026-01-01",
                "lease_end_date": "2027-01-01",
                "monthly_lease_cost": "0.00",
                "registration_document_number": "REG-001",
                "insurance_provider": "SEMKO Insurance",
                "insurance_policy_number": "POL-001",
                "insurance_expiry_date": "2027-01-01",
                "notes": "Company owned",
            },
            format="json",
        )
        self.assertEqual(ownership_response.status_code, status.HTTP_201_CREATED)

    def test_cannot_create_duplicate_vehicle_ownership(self):
        self.authenticate(self.manager)

        vehicle_response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA128A",
                "vin": "VIN-006",
                "make": "MAN",
                "model": "TGS",
                "year": 2024,
                "fuel_type": "diesel",
                "status": VehicleStatus.ACTIVE,
                "vehicle_type": self.vehicle_type.id,
                "current_mileage_km": 0,
                "seating_capacity": 2,
                "load_capacity_tonnes": "28.00",
                "color": "White",
                "engine_number": "ENGINE-006",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(vehicle_response.status_code, status.HTTP_201_CREATED)
        vehicle_id = vehicle_response.data["id"]

        first_response = self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "vehicle_id": vehicle_id,
                "ownership_type": OwnershipType.COMPANY_OWNED,
                "owner_name": "SEMKO Fleet",
                "registration_document_number": "REG-006",
                "insurance_provider": "SEMKO Insurance",
                "insurance_policy_number": "POL-006",
                "insurance_expiry_date": "2027-01-01",
            },
            format="json",
        )
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        duplicate_response = self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "vehicle_id": vehicle_id,
                "ownership_type": OwnershipType.COMPANY_OWNED,
                "owner_name": "SEMKO Fleet",
                "registration_document_number": "REG-007",
                "insurance_provider": "SEMKO Insurance",
                "insurance_policy_number": "POL-007",
                "insurance_expiry_date": "2027-01-01",
            },
            format="json",
        )
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle_id", duplicate_response.data)

    def test_vehicle_creation_rejects_non_positive_load_capacity(self):
        self.authenticate(self.manager)

        response = self.client.post(
            reverse("vehicle-list-create"),
            {
                "registration_number": "KDA129A",
                "vin": "VIN-007",
                "make": "DAF",
                "model": "LF",
                "year": 2024,
                "fuel_type": "diesel",
                "status": VehicleStatus.ACTIVE,
                "vehicle_type": self.vehicle_type.id,
                "current_mileage_km": 0,
                "seating_capacity": 2,
                "load_capacity_tonnes": "0.00",
                "color": "White",
                "engine_number": "ENGINE-007",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("load_capacity_tonnes", response.data)

    def test_vehicle_filters_work_for_status_and_ownership_type(self):
        vehicle_a = Vehicle.objects.create(
            registration_number="KDA126A",
            vin="VIN-004",
            make="Scania",
            model="P410",
            year=2023,
            fuel_type="diesel",
            status=VehicleStatus.ACTIVE,
            vehicle_type=self.vehicle_type,
            current_mileage_km=10000,
            seating_capacity=2,
            load_capacity_tonnes="32.00",
            chassis_number="CHASSIS-003",
            engine_number="ENGINE-003",
            color="Blue",
            is_active=True,
        )
        vehicle_b = Vehicle.objects.create(
            registration_number="KDA127A",
            vin="VIN-005",
            make="Volvo",
            model="FMX",
            year=2022,
            fuel_type="diesel",
            status=VehicleStatus.UNDER_MAINTENANCE,
            vehicle_type=self.vehicle_type,
            current_mileage_km=15000,
            seating_capacity=2,
            load_capacity_tonnes="30.00",
            chassis_number="CHASSIS-004",
            engine_number="ENGINE-004",
            color="Red",
            is_active=True,
        )

        self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "vehicle_id": vehicle_a.id,
                "ownership_type": OwnershipType.COMPANY_OWNED,
                "owner_name": "SEMKO Fleet",
                "lease_start_date": "2026-01-01",
                "lease_end_date": "2027-01-01",
                "monthly_lease_cost": "0.00",
                "registration_document_number": "REG-003",
                "insurance_provider": "SEMKO Insurance",
                "insurance_policy_number": "POL-003",
                "insurance_expiry_date": "2027-01-01",
                "notes": "Company owned",
            },
            format="json",
        )
        self.client.post(
            reverse("vehicle-ownership-list-create"),
            {
                "vehicle_id": vehicle_b.id,
                "ownership_type": OwnershipType.LEASED,
                "owner_name": "Partner Fleet",
                "lease_start_date": "2026-01-01",
                "lease_end_date": "2027-01-01",
                "monthly_lease_cost": "1500.00",
                "registration_document_number": "REG-004",
                "insurance_provider": "Partner Insurance",
                "insurance_policy_number": "POL-004",
                "insurance_expiry_date": "2027-01-01",
                "notes": "Leased vehicle",
            },
            format="json",
        )

        self.authenticate(self.viewer)

        response = self.client.get(
            reverse("vehicle-list-create"),
            {"status": VehicleStatus.UNDER_MAINTENANCE},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["registration_number"], "KDA127A")
