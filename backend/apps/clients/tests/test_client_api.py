from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.clients.models import Client, CorporateClientProfile, IndividualClientProfile, Quarry
from apps.core.constants import RolePermissionCodes
from apps.users.models import Role

User = get_user_model()


class ClientAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Commercial Manager",
            code="commercial-manager",
            permissions=[
                RolePermissionCodes.VIEW_CLIENTS,
                RolePermissionCodes.MANAGE_CLIENTS,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Commercial Viewer",
            code="commercial-viewer",
            permissions=[RolePermissionCodes.VIEW_CLIENTS],
        )
        self.manager = User.objects.create_user(
            username="client-admin",
            email="client-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="client-viewer",
            email="client-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_update_list_and_deactivate_corporate_client(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("client-list-create"),
            {
                "name": "Acme Construction Ltd",
                "code": "acme-construction",
                "client_type": "corporate",
                "contact_person": "Jane Mwangi",
                "phone_number": "0712345678",
                "email": "projects@acme.co.ke",
                "address": "Industrial Area",
                "town": "Nairobi",
                "county": "Nairobi",
                "status": "active",
                "is_active": True,
                "corporate_profile": {
                    "company_registration_number": "CPR-001",
                    "kra_pin": "P123456789A",
                    "credit_limit": "500000.00",
                    "payment_terms_days": 45,
                    "industry": "Construction",
                },
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        client_id = create_response.data["id"]

        list_response = self.client.get(reverse("client-list-create"), {"search": "Acme"})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            reverse("client-detail", kwargs={"pk": client_id}),
            {"status": "suspended", "notes": "Credit review pending"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["status"], "suspended")

        delete_response = self.client.delete(
            reverse("client-detail", kwargs={"pk": client_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        client = Client.objects.get(pk=client_id)
        self.assertFalse(client.is_active)
        self.assertEqual(client.status, Client.Status.INACTIVE)

    def test_manager_can_create_and_manage_quarry(self):
        self.authenticate(self.manager)
        client = Client.objects.create(
            name="Stone Supply Ltd",
            code="stone-supply",
            client_type=Client.ClientType.CORPORATE,
            phone_number="0700000000",
        )

        response = self.client.post(
            reverse("quarry-list-create"),
            {
                "name": "Kajiado Main Quarry",
                "code": "kajiado-main",
                "client_id": client.id,
                "county": "Kajiado",
                "town": "Kajiado Town",
                "contact_person": "Quarry Ops",
                "phone_number": "0711111111",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        quarry_id = response.data["id"]

        patch_response = self.client.patch(
            reverse("quarry-detail", kwargs={"pk": quarry_id}),
            {"notes": "Primary loading point"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

    def test_viewer_can_list_but_cannot_create_client(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("client-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("client-list-create"),
            {
                "name": "Blocked Client",
                "code": "blocked-client",
                "client_type": "individual",
                "phone_number": "0799999999",
                "individual_profile": {
                    "national_id": "12345679",
                    "occupation": "Contractor",
                },
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_switch_client_type_and_cleanup_profiles(self):
        self.authenticate(self.manager)

        create_response = self.client.post(
            reverse("client-list-create"),
            {
                "name": "Switching Client",
                "code": "switching-client",
                "client_type": "corporate",
                "contact_person": "Alice Mwangi",
                "phone_number": "0722222222",
                "corporate_profile": {
                    "company_registration_number": "CPR-009",
                    "kra_pin": "P987654321B",
                    "credit_limit": "150000.00",
                    "payment_terms_days": 30,
                    "industry": "Mining",
                },
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        client_id = create_response.data["id"]

        switch_response = self.client.patch(
            reverse("client-detail", kwargs={"pk": client_id}),
            {
                "client_type": "individual",
                "individual_profile": {
                    "national_id": "876543210",
                    "occupation": "Contractor",
                },
            },
            format="json",
        )

        self.assertEqual(switch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(switch_response.data["client_type"], "individual")

        client = Client.objects.get(pk=client_id)
        self.assertFalse(CorporateClientProfile.objects.filter(client=client).exists())
        self.assertTrue(IndividualClientProfile.objects.filter(client=client).exists())

    def test_client_and_quarry_filters_work(self):
        client = Client.objects.create(
            name="Alpha Estates",
            code="alpha-estates",
            client_type=Client.ClientType.INDIVIDUAL,
            phone_number="0701234567",
            status=Client.Status.ACTIVE,
            county="Machakos",
            is_active=True,
        )
        Quarry.objects.create(
            name="Machakos Quarry",
            code="machakos-quarry",
            client=client,
            county="Machakos",
            is_active=True,
        )
        self.authenticate(self.viewer)

        client_response = self.client.get(
            reverse("client-list-create"),
            {"client_type": Client.ClientType.INDIVIDUAL},
        )
        quarry_response = self.client.get(
            reverse("quarry-list-create"),
            {"county": "Machakos"},
        )

        self.assertEqual(client_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(client_response.data), 1)
        self.assertEqual(quarry_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(quarry_response.data), 1)
