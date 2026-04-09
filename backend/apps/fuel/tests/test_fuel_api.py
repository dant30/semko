from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver
from apps.fuel.models import FuelConsumption, FuelStation, FuelTransaction
from apps.users.models import Role
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.models.vehicle_type import VehicleType

User = get_user_model()


class FuelAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Fuel Manager",
            code="fuel-manager",
            permissions=[
                RolePermissionCodes.VIEW_FUEL,
                RolePermissionCodes.MANAGE_FUEL,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Fuel Viewer",
            code="fuel-viewer",
            permissions=[RolePermissionCodes.VIEW_FUEL],
        )
        self.manager = User.objects.create_user(
            username="fuel-manager",
            email="fuel-manager@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="fuel-viewer",
            email="fuel-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.vehicle_type = VehicleType.objects.create(name="Tipper", code="tipper")
        self.ownership = VehicleOwnership.objects.create(
            name="Company Fleet",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            effective_from="2026-01-01",
            is_active=True,
        )
        self.vehicle = Vehicle.objects.create(
            registration_number="KDA123A",
            fleet_number="FLT-001",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Isuzu",
            model="Forward",
            year=2020,
            chassis_number="CHASSIS-001",
            engine_number="ENG-001",
            capacity_tonnes="28.00",
            is_active=True,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-001",
            first_name="John",
            last_name="Doe",
            national_id="12345678",
            phone_number="0712345678",
            email="driver@example.com",
            date_of_birth="1990-01-01",
            hire_date="2020-01-01",
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_station_and_transaction(self):
        self.authenticate(self.manager)

        station_response = self.client.post(
            reverse("fuel-station-list-create"),
            {
                "name": "Main Depot Pump",
                "code": "main-depot-pump",
                "station_type": "internal",
                "location": "Nairobi Yard",
                "contact_person": "Fuel Clerk",
                "contact_phone": "0700000000",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(station_response.status_code, status.HTTP_201_CREATED)
        station_id = station_response.data["id"]

        transaction_response = self.client.post(
            reverse("fuel-transaction-list-create"),
            {
                "reference_no": "FUEL-001",
                "transaction_date": "2026-03-19",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "station_id": station_id,
                "fuel_type": "diesel",
                "litres": "120.00",
                "unit_price": "170.00",
                "odometer_reading": "150000.00",
                "full_tank": True,
                "payment_method": "internal",
                "notes": "Morning refuel",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(transaction_response.status_code, status.HTTP_201_CREATED)
        transaction = FuelTransaction.objects.get(
            reference_no=transaction_response.data["reference_no"]
        )
        self.assertEqual(str(transaction.total_cost), "20400.00")

    def test_manager_can_create_consumption_and_get_efficiency_metrics(self):
        self.authenticate(self.manager)

        response = self.client.post(
            reverse("fuel-consumption-list-create"),
            {
                "vehicle_id": self.vehicle.id,
                "period_start": "2026-03-01",
                "period_end": "2026-03-15",
                "opening_odometer": "150000.00",
                "closing_odometer": "151200.00",
                "total_litres": "300.00",
                "total_cost": "51000.00",
                "notes": "Half-month review",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        consumption = FuelConsumption.objects.get(pk=response.data["id"])
        self.assertEqual(str(consumption.distance_covered), "1200.00")
        self.assertEqual(str(consumption.km_per_litre), "4.00")
        self.assertEqual(str(consumption.litres_per_100km), "25.00")

    def test_viewer_can_list_but_cannot_create_transaction(self):
        station = FuelStation.objects.create(
            name="External Station",
            code="external-station",
            station_type=FuelStation.StationType.EXTERNAL,
            location="Mombasa Road",
            is_active=True,
        )
        FuelTransaction.objects.create(
            reference_no="FUEL-002",
            transaction_date="2026-03-19",
            vehicle=self.vehicle,
            driver=self.driver,
            station=station,
            fuel_type=FuelTransaction.FuelType.DIESEL,
            litres=Decimal("60.00"),
            unit_price=Decimal("169.00"),
            odometer_reading=Decimal("150600.00"),
            payment_method=FuelTransaction.PaymentMethod.CREDIT,
            is_active=True,
        )
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("fuel-transaction-list-create"))
        create_response = self.client.post(
            reverse("fuel-transaction-list-create"),
            {
                "reference_no": "FUEL-003",
                "transaction_date": "2026-03-20",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "station_id": station.id,
                "fuel_type": "diesel",
                "litres": "80.00",
                "unit_price": "171.00",
                "odometer_reading": "150900.00",
                "payment_method": "cash",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_transaction_filters_work(self):
        station = FuelStation.objects.create(
            name="Depot B",
            code="depot-b",
            station_type=FuelStation.StationType.INTERNAL,
            location="Yard B",
            is_active=True,
        )
        FuelTransaction.objects.create(
            reference_no="FUEL-004",
            transaction_date="2026-03-19",
            vehicle=self.vehicle,
            driver=self.driver,
            station=station,
            fuel_type=FuelTransaction.FuelType.DIESEL,
            litres=Decimal("70.00"),
            unit_price=Decimal("168.00"),
            odometer_reading=Decimal("151000.00"),
            payment_method=FuelTransaction.PaymentMethod.INTERNAL,
            is_active=True,
        )
        self.authenticate(self.viewer)

        response = self.client.get(
            reverse("fuel-transaction-list-create"),
            {"vehicle_id": self.vehicle.id, "fuel_type": "diesel", "active_only": "true"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
