from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.materials.models import Material, MaterialPrice
from apps.users.models import Role

User = get_user_model()


class MaterialAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Inventory Manager",
            code="inventory-manager",
            permissions=[
                RolePermissionCodes.VIEW_MATERIALS,
                RolePermissionCodes.MANAGE_MATERIALS,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Inventory Viewer",
            code="inventory-viewer",
            permissions=[RolePermissionCodes.VIEW_MATERIALS],
        )
        self.manager = User.objects.create_user(
            username="material-admin",
            email="material-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="material-viewer",
            email="material-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_update_list_and_deactivate_material(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("material-list-create"),
            {
                "name": "Ballast 20mm",
                "code": "ballast-20mm",
                "category": "aggregate",
                "unit_of_measure": "tonne",
                "description": "Standard ballast aggregate",
                "density_factor": "1.650",
                "is_active": True,
                "initial_price": {
                    "price_per_unit": "2500.00",
                    "currency": "KES",
                    "effective_from": "2026-03-01",
                    "notes": "Opening price",
                    "is_active": True,
                },
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        material_id = create_response.data["id"]

        list_response = self.client.get(
            reverse("material-list-create"),
            {"search": "Ballast"},
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            reverse("material-detail", kwargs={"pk": material_id}),
            {"description": "Updated ballast material"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["description"], "Updated ballast material")

        delete_response = self.client.delete(
            reverse("material-detail", kwargs={"pk": material_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Material.objects.get(pk=material_id).is_active)

    def test_manager_can_create_and_update_material_prices(self):
        self.authenticate(self.manager)
        material = Material.objects.create(
            name="Quarry Dust",
            code="quarry-dust",
            category=Material.MaterialCategory.DUST,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )

        create_response = self.client.post(
            reverse("material-price-list-create"),
            {
                "material_id": material.id,
                "price_per_unit": "1800.00",
                "currency": "KES",
                "effective_from": "2026-04-01",
                "effective_to": "2026-12-31",
                "notes": "Seasonal price",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        price_id = create_response.data["id"]

        patch_response = self.client.patch(
            reverse("material-price-detail", kwargs={"pk": price_id}),
            {"price_per_unit": "1900.00"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["price_per_unit"], "1900.00")

    def test_viewer_can_list_but_cannot_create_material(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("material-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("material-list-create"),
            {
                "name": "Tarmac Premium",
                "code": "tarmac-premium",
                "category": "tarmac",
                "unit_of_measure": "trip",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_material_and_price_filters_work(self):
        material = Material.objects.create(
            name="Murram",
            code="murram",
            category=Material.MaterialCategory.OTHER,
            unit_of_measure=Material.UnitOfMeasure.CUBIC_METER,
            is_active=True,
        )
        MaterialPrice.objects.create(
            material=material,
            price_per_unit="1500.00",
            currency="KES",
            effective_from="2026-01-01",
            effective_to="2026-12-31",
            is_active=True,
        )
        self.authenticate(self.viewer)

        material_response = self.client.get(
            reverse("material-list-create"),
            {"category": Material.MaterialCategory.OTHER},
        )
        price_response = self.client.get(
            reverse("material-price-list-create"),
            {"material_id": material.id, "active_only": "true"},
        )

        self.assertEqual(material_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(material_response.data), 1)
        self.assertEqual(price_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(price_response.data), 1)
