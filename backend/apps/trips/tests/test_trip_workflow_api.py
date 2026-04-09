from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.cess.models import CessRate
from apps.clients.models import Client, Quarry
from apps.core.constants import RolePermissionCodes
from apps.drivers.models import Driver, DriverLicense
from apps.materials.models import Material
from apps.trips.models import Trip
from apps.users.models import Role
from apps.vehicles.models.vehicle import Vehicle
from apps.vehicles.models.ownership import VehicleOwnership
from apps.vehicles.models.vehicle_type import VehicleType
from apps.vehicles.constants import VehicleStatus

User = get_user_model()


class TripWorkflowAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Trips Workflow Manager",
            code="trips-workflow-manager",
            permissions=[
                RolePermissionCodes.VIEW_TRIPS,
                RolePermissionCodes.MANAGE_TRIPS,
                RolePermissionCodes.VIEW_CESS,
                RolePermissionCodes.MANAGE_CESS,
            ],
        )
        self.manager = User.objects.create_user(
            username="workflow-admin",
            email="workflow-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.vehicle_type = VehicleType.objects.create(
            name="Workflow Tipper",
            code="workflow-tipper",
            default_capacity_tonnes="28.00",
            axle_count=4,
        )
        self.ownership = VehicleOwnership.objects.create(
            name="Workflow Fleet",
            ownership_type=VehicleOwnership.OwnershipType.OWNED,
            effective_from="2026-01-01",
        )
        self.vehicle = Vehicle.objects.create(
            registration_number="KDA888A",
            fleet_number="FLT-WORK-01",
            vehicle_type=self.vehicle_type,
            ownership=self.ownership,
            make="Isuzu",
            model="Giga",
            year=2024,
            chassis_number="WORKFLOW-CHASSIS-001",
            capacity_tonnes="28.00",
            status=VehicleStatus.ACTIVE,
            is_active=True,
        )
        self.driver = Driver.objects.create(
            employee_id="DRV-WORK-01",
            first_name="Mary",
            last_name="Workflow",
            national_id="77770001",
            phone_number="0711111111",
            date_of_birth="1991-01-01",
            hire_date="2021-01-01",
            employment_status=Driver.EmploymentStatus.ACTIVE,
            is_active=True,
        )
        DriverLicense.objects.create(
            driver=self.driver,
            license_number="LIC-WORK-001",
            license_class="BCE",
            issue_date="2021-01-01",
            expiry_date="2029-01-01",
            status=DriverLicense.LicenseStatus.VALID,
        )
        self.client_record = Client.objects.create(
            name="Workflow Client",
            code="workflow-client",
            client_type=Client.ClientType.CORPORATE,
            phone_number="0700000000",
            status=Client.Status.ACTIVE,
            is_active=True,
        )
        self.quarry = Quarry.objects.create(
            name="Workflow Quarry",
            code="workflow-quarry",
            client=self.client_record,
            county="Kajiado",
            is_active=True,
        )
        self.material = Material.objects.create(
            name="Workflow Material",
            code="workflow-material",
            category=Material.MaterialCategory.AGGREGATE,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )
        self.cess_rate = CessRate.objects.create(
            name="Workflow Cess Rate",
            code="workflow-cess-rate",
            county="Kajiado",
            material=self.material,
            rate_type=CessRate.RateType.PER_TONNE,
            amount="100.00",
            effective_from="2026-01-01",
            is_active=True,
        )

    def authenticate(self):
        token = str(RefreshToken.for_user(self.manager).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_trip_creation_can_generate_cess_transaction_from_rate(self):
        self.authenticate()

        response = self.client.post(
            reverse("trip-list-create"),
            {
                "trip_number": "TRIP-CESS-001",
                "delivery_note_number": "DN-CESS-001",
                "trip_date": "2026-04-01",
                "vehicle_id": self.vehicle.id,
                "driver_id": self.driver.id,
                "client_id": self.client_record.id,
                "quarry_id": self.quarry.id,
                "material_id": self.material.id,
                "destination": "Kajiado Site",
                "trip_type": "owned",
                "quantity_unit": "tonne",
                "expected_quantity": "28.00",
                "agreed_unit_price": "2500.00",
                "status": "in_progress",
                "cess_transaction": {
                    "status": "assessed",
                    "notes": "Auto-assessed from rate"
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["cess_transaction"]["amount"], "2800.00")
        self.assertEqual(response.data["cess_transaction"]["county"], "Kajiado")

    def test_trip_document_endpoint_accepts_delivery_note_upload(self):
        self.authenticate()
        trip = Trip.objects.create(
            trip_number="TRIP-DOC-001",
            delivery_note_number="DN-DOC-001",
            trip_date="2026-04-02",
            vehicle=self.vehicle,
            driver=self.driver,
            client=self.client_record,
            quarry=self.quarry,
            material=self.material,
            destination="Document Site",
            trip_type=Trip.TripType.OWNED,
            quantity_unit="tonne",
            expected_quantity="20.00",
            agreed_unit_price="2500.00",
            status=Trip.Status.DRAFT,
            is_active=True,
        )
        upload = SimpleUploadedFile(
            "delivery-note.txt",
            b"Delivery note contents",
            content_type="text/plain",
        )

        response = self.client.patch(
            reverse("trip-document-update", kwargs={"pk": trip.id}),
            {"delivery_note_document": upload, "documents_verified": True},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        trip.refresh_from_db()
        self.assertTrue(trip.documents_verified)
        self.assertTrue(bool(trip.delivery_note_document))

        metadata_response = self.client.get(
            reverse("trip-document-metadata", kwargs={"pk": trip.id})
        )
        self.assertEqual(metadata_response.status_code, status.HTTP_200_OK)
        self.assertEqual(metadata_response.data["documents_verified"], True)
        self.assertEqual(metadata_response.data["file_url"], "")

        download_response = self.client.get(
            reverse("trip-document-download", kwargs={"pk": trip.id})
        )
        self.assertEqual(download_response.status_code, status.HTTP_200_OK)

    def test_trip_summary_endpoints_return_report_ready_data(self):
        self.authenticate()
        trip = Trip.objects.create(
            trip_number="TRIP-SUM-001",
            delivery_note_number="DN-SUM-001",
            trip_date="2026-04-03",
            vehicle=self.vehicle,
            driver=self.driver,
            client=self.client_record,
            quarry=self.quarry,
            material=self.material,
            destination="Summary Site",
            trip_type=Trip.TripType.OWNED,
            quantity_unit="tonne",
            expected_quantity="25.00",
            agreed_unit_price="2400.00",
            status=Trip.Status.DELIVERED,
            documents_verified=True,
            is_active=True,
        )

        summary_response = self.client.get(
            reverse("trip-summary", kwargs={"pk": trip.id})
        )
        self.assertEqual(summary_response.status_code, status.HTTP_200_OK)
        self.assertEqual(summary_response.data["trip_number"], "TRIP-SUM-001")

        operations_response = self.client.get(reverse("trip-operations-summary"))
        self.assertEqual(operations_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(operations_response.data["total_trips"], 1)
