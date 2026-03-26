from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver
from apps.maintenance.models import MaintenanceSchedule, PartUsed, ServiceRecord
from apps.stores.models import Item, StockReceiving
from apps.users.models import Role
from apps.vehicles.models import Vehicle, VehicleOwnership, VehicleType

User = get_user_model()


class MaintenanceAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Maintenance Manager",
            code="maintenance-manager",
            permissions=[
                RolePermissionCodes.VIEW_MAINTENANCE,
                RolePermissionCodes.MANAGE_MAINTENANCE,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Maintenance Viewer",
            code="maintenance-viewer",
            permissions=[RolePermissionCodes.VIEW_MAINTENANCE],
        )
        self.manager = User.objects.create_user(
            username="maintenance-manager",
            email="maintenance-manager@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="maintenance-viewer",
            email="maintenance-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.vehicle_type = VehicleType.objects.create(name="Trailer", code="trailer")
        self.ownership = VehicleOwnership.objects.create(
            name="Owned Fleet",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            effective_from="2026-01-01",
            is_active=True,
        )
        self.vehicle = Vehicle.objects.create(
            registration_number="KDB456B",
            fleet_number="FLT-002",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Mercedes",
            model="Actros",
            year=2021,
            chassis_number="CHASSIS-002",
            engine_number="ENG-002",
            capacity_tonnes="30.00",
            is_active=True,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-010",
            first_name="Jane",
            last_name="Smith",
            national_id="22334455",
            phone_number="0722000000",
            email="jane@example.com",
            date_of_birth="1992-02-02",
            hire_date="2021-01-01",
            is_active=True,
        )
        self.item = Item.objects.create(
            name="Brake Lining",
            code="brake-lining",
            category=Item.ItemCategory.SPARE_PART,
            unit_of_measure=Item.UnitOfMeasure.PIECE,
            reorder_level="2.00",
            is_active=True,
        )
        StockReceiving.objects.create(
            item=self.item,
            reference_no="GRN-MNT-001",
            received_date="2026-03-01",
            quantity=Decimal("10.00"),
            supplier_name="Brake Supplier",
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_overdue_schedule(self):
        self.authenticate(self.manager)
        response = self.client.post(
            reverse("maintenance-schedule-list-create"),
            {
                "vehicle_id": self.vehicle.id,
                "reference_no": "SCH-001",
                "title": "Brake Inspection",
                "maintenance_type": "inspection",
                "interval_days": 7,
                "last_service_date": "2026-01-01",
                "last_service_odometer": "120000.00",
                "current_odometer": "130000.00",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        schedule = MaintenanceSchedule.objects.get(reference_no="SCH-001")
        self.assertEqual(schedule.status, MaintenanceSchedule.ScheduleStatus.OVERDUE)

    def test_service_record_completion_updates_schedule_and_costs(self):
        self.authenticate(self.manager)
        mechanic_response = self.client.post(
            reverse("maintenance-mechanic-list-create"),
            {
                "employee_id": "MEC-001",
                "first_name": "Alex",
                "last_name": "Kamau",
                "employment_type": "internal",
                "specialization": "Heavy Truck Service",
                "is_active": True,
            },
            format="json",
        )
        mechanic_id = mechanic_response.data["id"]

        schedule = MaintenanceSchedule.objects.create(
            vehicle=self.vehicle,
            reference_no="SCH-002",
            title="Routine Service",
            maintenance_type=MaintenanceSchedule.MaintenanceType.PREVENTIVE,
            interval_days=30,
            interval_km=10000,
            last_service_date="2026-02-01",
            last_service_odometer=Decimal("100000.00"),
            next_due_date="2026-03-03",
            next_due_odometer=Decimal("110000.00"),
            current_odometer=Decimal("110000.00"),
            is_active=True,
        )

        record_response = self.client.post(
            reverse("maintenance-service-record-list-create"),
            {
                "vehicle_id": self.vehicle.id,
                "schedule_id": schedule.id,
                "mechanic_id": mechanic_id,
                "reference_no": "SR-001",
                "title": "Routine 10k Service",
                "service_date": "2026-03-19",
                "odometer_reading": "110500.00",
                "labor_cost": "4000.00",
                "external_cost": "1500.00",
                "status": "completed",
                "work_performed": "Routine service completed",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(record_response.status_code, status.HTTP_201_CREATED)
        record_id = record_response.data["id"]

        part_response = self.client.post(
            reverse("maintenance-part-used-list-create"),
            {
                "service_record_id": record_id,
                "item_id": self.item.id,
                "quantity": "2.00",
                "unit_cost": "2500.00",
                "notes": "Front axle replacement",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(part_response.status_code, status.HTTP_201_CREATED)

        service_record = ServiceRecord.objects.get(pk=record_id)
        schedule.refresh_from_db()
        self.assertEqual(str(service_record.total_parts_cost), "5000.00")
        self.assertEqual(str(service_record.total_cost), "10500.00")
        self.assertEqual(schedule.status, MaintenanceSchedule.ScheduleStatus.COMPLETED)
        self.assertEqual(str(schedule.last_service_odometer), "110500.00")

    def test_part_used_cannot_exceed_available_store_stock(self):
        self.authenticate(self.manager)
        mechanic = self._create_mechanic()
        service_record = ServiceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=mechanic,
            reference_no="SR-002",
            title="Brake Repair",
            service_date="2026-03-19",
            odometer_reading=Decimal("111000.00"),
            labor_cost=Decimal("1000.00"),
            external_cost=Decimal("0.00"),
            is_active=True,
        )

        response = self.client.post(
            reverse("maintenance-part-used-list-create"),
            {
                "service_record_id": service_record.id,
                "item_id": self.item.id,
                "quantity": "20.00",
                "unit_cost": "2500.00",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

    def test_viewer_can_list_but_cannot_create_mechanic(self):
        self.authenticate(self.viewer)
        list_response = self.client.get(reverse("maintenance-mechanic-list-create"))
        create_response = self.client.post(
            reverse("maintenance-mechanic-list-create"),
            {
                "employee_id": "MEC-002",
                "first_name": "Chris",
                "last_name": "Otieno",
                "employment_type": "contract",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def _create_mechanic(self):
        from apps.maintenance.models import Mechanic

        return Mechanic.objects.create(
            employee_id="MEC-010",
            first_name="Paul",
            last_name="Njoroge",
            employment_type="internal",
            is_active=True,
        )
