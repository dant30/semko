from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.stores.models import Supplier
from apps.users.models import Role

User = get_user_model()


class SupplierAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Stores Manager",
            code="stores-manager",
            permissions=[
                RolePermissionCodes.VIEW_STORES,
                RolePermissionCodes.MANAGE_STORES,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Stores Viewer",
            code="stores-viewer",
            permissions=[RolePermissionCodes.VIEW_STORES],
        )
        self.manager = User.objects.create_user(
            username="stores-manager",
            email="stores-manager@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="stores-viewer",
            email="stores-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )

        # Create test suppliers
        self.supplier1 = Supplier.objects.create(
            name="Parts Depot",
            contact_name="John Doe",
            email="john@partsdepot.com",
            phone="+1234567890",
            address="123 Parts St, City",
            is_active=True,
        )
        self.supplier2 = Supplier.objects.create(
            name="Automotive Supplies",
            contact_name="Jane Smith",
            email="jane@autosupply.com",
            phone="+0987654321",
            address="456 Auto Ave, Town",
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_viewer_can_list_active_suppliers(self):
        self.authenticate(self.viewer)
        response = self.client.get(reverse("store-supplier-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["name"], self.supplier1.name)

    def test_viewer_cannot_create_supplier(self):
        self.authenticate(self.viewer)
        response = self.client.post(
            reverse("store-supplier-create"),
            {
                "name": "New Supplier",
                "contact_name": "Contact",
                "email": "contact@newsupplier.com",
                "phone": "+1111111111",
                "address": "Address",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_create_supplier(self):
        self.authenticate(self.manager)
        response = self.client.post(
            reverse("store-supplier-create"),
            {
                "name": "New Supplier",
                "contact_name": "Contact Name",
                "email": "contact@newsupplier.com",
                "phone": "+1111111111",
                "address": "789 Supply Rd, Village",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Supplier")
        self.assertEqual(response.data["email"], "contact@newsupplier.com")

    def test_cannot_create_supplier_with_duplicate_name(self):
        self.authenticate(self.manager)
        response = self.client.post(
            reverse("store-supplier-create"),
            {
                "name": "Parts Depot",  # Duplicate name
                "contact_name": "Another Contact",
                "email": "another@example.com",
                "phone": "+9999999999",
                "address": "Different Address",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_manager_can_retrieve_supplier_detail(self):
        self.authenticate(self.manager)
        response = self.client.get(
            reverse("store-supplier-detail", kwargs={"pk": self.supplier1.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.supplier1.name)
        self.assertEqual(response.data["id"], self.supplier1.id)

    def test_manager_can_update_supplier(self):
        self.authenticate(self.manager)
        response = self.client.patch(
            reverse("store-supplier-detail", kwargs={"pk": self.supplier1.id}),
            {
                "contact_name": "Updated Contact",
                "phone": "+5555555555",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["contact_name"], "Updated Contact")
        self.assertEqual(response.data["phone"], "+5555555555")

    def test_manager_can_soft_delete_supplier(self):
        self.authenticate(self.manager)
        supplier_id = self.supplier1.id
        response = self.client.delete(
            reverse("store-supplier-detail", kwargs={"pk": supplier_id})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify soft delete: supplier still exists but is_active=False
        self.supplier1.refresh_from_db()
        self.assertFalse(self.supplier1.is_active)

    def test_deleted_supplier_not_in_list(self):
        self.authenticate(self.manager)
        self.supplier2.is_active = False
        self.supplier2.save()

        list_response = self.client.get(reverse("store-supplier-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["id"], self.supplier1.id)

    def test_manager_can_update_supplier_case_insensitive_duplicate_check(self):
        """Ensure duplicate name check is case-insensitive and excludes self."""
        self.authenticate(self.manager)

        # Should allow updating supplier with same name (case variations)
        response = self.client.patch(
            reverse("store-supplier-detail", kwargs={"pk": self.supplier1.id}),
            {
                "name": "PARTS DEPOT",  # Different case, same supplier
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # But should not allow changing to another supplier's name
        response2 = self.client.patch(
            reverse("store-supplier-detail", kwargs={"pk": self.supplier1.id}),
            {
                "name": "Automotive Supplies",  # Another supplier's name
            },
            format="json",
        )
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
