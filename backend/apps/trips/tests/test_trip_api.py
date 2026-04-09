from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.clients.models import Client, Quarry
from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver, DriverLicense
from apps.materials.models import Material
from apps.rules.models import PenaltyThresholdRule, TripClassificationRule
from apps.trips.models import Trip
from apps.users.models import Role
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.models.vehicle_type import VehicleType
from apps.vehicles.constants import VehicleStatus

User = get_user_model()


class TripAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Trips Manager",
            code="trips-manager",
            permissions=[
                RolePermissionCodes.VIEW_TRIPS,
                RolePermissionCodes.MANAGE_TRIPS,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Trips Viewer",
            code="trips-viewer",
            permissions=[RolePermissionCodes.VIEW_TRIPS],
        )
        self.manager = User.objects.create_user(
            username="trip-admin",
            email="trip-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="trip-viewer",
            email="trip-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.vehicle_type = VehicleType.objects.create(
            name="Tipper Trips",
            code="tipper-trips",
            default_capacity_tonnes="28.00",
            axle_count=4,
        )
        self.ownership = VehicleOwnership.objects.create(
            name="SEMKO Fleet Trips",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            effective_from="2026-01-01",
        )
        self.vehicle = Vehicle.objects.create(
            registration_number="KDA777A",
            fleet_number="FLT-TRIP-01",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Isuzu",
            model="FVZ",
            year=2024,
            chassis_number="TRIP-CHASSIS-001",
            capacity_tonnes="28.00",
            status=VehicleStatus.ACTIVE,
            is_active=True,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-TRIP-01",
            first_name="John",
            last_name="Trips",
            national_id="99990001",
            phone_number="0712000000",
            date_of_birth="1990-01-01",
            hire_date="2020-01-01",
            employment_status=Driver.EmploymentStatus.ACTIVE,
            is_active=True,
        )
        DriverLicense.objects.create(
            driver=self.driver,
            license_number="LIC-TRIP-001",
            license_class="BCE",
            issue_date="2020-01-01",
            expiry_date="2028-01-01",
            status=DriverLicense.LicenseStatus.VALID,
        )
        self.client_record = Client.objects.create(
            name="Trip Client",
            code="trip-client",
            client_type=Client.ClientType.CORPORATE,
            phone_number="0700001234",
            status=Client.Status.ACTIVE,
            is_active=True,
        )
        self.quarry = Quarry.objects.create(
            name="Trip Quarry",
            code="trip-quarry",
            client=self.client_record,
            county="Kajiado",
            is_active=True,
        )
        self.material = Material.objects.create(
            name="Trip Ballast",
            code="trip-ballast",
            category=Material.MaterialCategory.AGGREGATE,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )
        TripClassificationRule.objects.create(
            name="Kitengela Rule",
            code="kitengela-rule",
            classification_label="Urban Delivery",
            destination_keyword="kitengela",
            priority=1,
            is_active=True,
        )
        PenaltyThresholdRule.objects.create(
            name="Standard Penalty",
            code="standard-penalty",
            minimum_percentage="2.51",
            maximum_percentage="100.00",
            tolerance_percentage="2.50",
            penalty_multiplier="1.25",
            priority=1,
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_update_list_and_cancel_trip(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("trip-list-create"),
            {
                "trip_number": "TRIP-001",
                "delivery_note_number": "DN-001",
                "trip_date": "2026-03-18",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "client_id": self.client_record.id,
                "quarry_id": self.quarry.id,
                "material_id": self.material.id,
                "destination": "Kitengela Site",
                "trip_type": "owned",
                "quantity_unit": "tonne",
                "expected_quantity": "28.00",
                "agreed_unit_price": "2500.00",
                "status": "in_progress",
                "weighbridge_reading": {
                    "quarry_gross_weight": "42.00",
                    "quarry_tare_weight": "14.00",
                    "site_gross_weight": "41.00",
                    "site_tare_weight": "14.00"
                },
                "discrepancy": {
                    "tolerance_percentage": "2.50",
                    "notes": "Initial calculation"
                }
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        trip_id = create_response.data["id"]

        list_response = self.client.get(reverse("trip-list-create"), {"search": "TRIP-001"})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(
            list_response.data[0]["weighbridge_reading"]["quarry_net_weight"],
            "28.00",
        )
        self.assertEqual(
            list_response.data[0]["classification_label"],
            "Urban Delivery",
        )

        update_response = self.client.patch(
            reverse("trip-detail", kwargs={"pk": trip_id}),
            {"status": "delivered", "remarks": "Delivered successfully"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["status"], "delivered")

        delete_response = self.client.delete(reverse("trip-detail", kwargs={"pk": trip_id}))
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        trip = Trip.objects.get(pk=trip_id)
        self.assertFalse(trip.is_active)
        self.assertEqual(trip.status, Trip.Status.CANCELLED)

    def test_hired_trip_creation_creates_hired_trip_record(self):
        self.authenticate(self.manager)

        response = self.client.post(
            reverse("trip-list-create"),
            {
                "trip_number": "TRIP-002",
                "delivery_note_number": "DN-002",
                "trip_date": "2026-03-19",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "client_id": self.client_record.id,
                "quarry_id": self.quarry.id,
                "material_id": self.material.id,
                "destination": "Machakos Site",
                "trip_type": "hired",
                "quantity_unit": "tonne",
                "expected_quantity": "28.00",
                "agreed_unit_price": "2600.00",
                "status": "in_progress",
                "hired_trip": {
                    "owner_name": "Partner Hauliers",
                    "owner_rate_per_trip": "18000.00",
                    "settlement_status": "pending",
                    "notes": "External truck settlement"
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["hired_trip"]["owner_total_amount"], "18000.00")

    def test_viewer_can_list_but_cannot_create_trip(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("trip-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("trip-list-create"),
            {
                "trip_number": "TRIP-003",
                "delivery_note_number": "DN-003",
                "trip_date": "2026-03-20",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "client_id": self.client_record.id,
                "quarry_id": self.quarry.id,
                "material_id": self.material.id,
                "destination": "Blocked Site",
                "trip_type": "owned",
                "quantity_unit": "tonne",
                "expected_quantity": "28.00",
                "agreed_unit_price": "2400.00",
                "status": "draft"
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_trip_filters_work(self):
        Trip.objects.create(
            trip_number="TRIP-004",
            delivery_note_number="DN-004",
            trip_date="2026-03-21",
            vehicle=self.vehicle,
            driver=self.driver,
            client=self.client_record,
            quarry=self.quarry,
            material=self.material,
            destination="Nairobi",
            trip_type=Trip.TripType.OWNED,
            quantity_unit="tonne",
            expected_quantity="28.00",
            agreed_unit_price="2500.00",
            status=Trip.Status.DELIVERED,
            is_active=True,
        )
        self.authenticate(self.viewer)

        response = self.client.get(reverse("trip-list-create"), {"status": Trip.Status.DELIVERED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
