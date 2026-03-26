from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.cess.models import CessRate
from apps.core.constants import RolePermissionCodes
from apps.materials.models import Material
from apps.users.models import Role

User = get_user_model()


class CessAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Cess Manager",
            code="cess-manager",
            permissions=[
                RolePermissionCodes.VIEW_CESS,
                RolePermissionCodes.MANAGE_CESS,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Cess Viewer",
            code="cess-viewer",
            permissions=[RolePermissionCodes.VIEW_CESS],
        )
        self.manager = User.objects.create_user(
            username="cess-admin",
            email="cess-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="cess-viewer",
            email="cess-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.material = Material.objects.create(
            name="Cess Ballast",
            code="cess-ballast",
            category=Material.MaterialCategory.AGGREGATE,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_and_update_cess_rate(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("cess-rate-list-create"),
            {
                "name": "Kajiado Ballast Rate",
                "code": "kajiado-ballast-rate",
                "county": "Kajiado",
                "material": self.material.id,
                "rate_type": "per_tonne",
                "amount": "120.00",
                "effective_from": "2026-01-01",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        rate_id = create_response.data["id"]

        patch_response = self.client.patch(
            reverse("cess-rate-detail", kwargs={"pk": rate_id}),
            {"amount": "140.00"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["amount"], "140.00")

    def test_viewer_can_list_but_cannot_create_cess_rate(self):
        CessRate.objects.create(
            name="Existing Rate",
            code="existing-rate",
            county="Kajiado",
            material=self.material,
            rate_type=CessRate.RateType.PER_TONNE,
            amount="100.00",
            effective_from="2026-01-01",
            is_active=True,
        )
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("cess-rate-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        create_response = self.client.post(
            reverse("cess-rate-list-create"),
            {
                "name": "Blocked Rate",
                "code": "blocked-rate",
                "county": "Nairobi",
                "material": self.material.id,
                "rate_type": "per_trip",
                "amount": "1000.00",
                "effective_from": "2026-02-01",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)
