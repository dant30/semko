from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.audit.models import AuditLog
from apps.core.constants import RolePermissionCodes
from apps.users.models import Role
from apps.users.serializers import DEFAULT_ADMIN_ROLE_PERMISSIONS

User = get_user_model()


class AuthAPITests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name="Operations Admin",
            code="operations-admin",
            permissions=DEFAULT_ADMIN_ROLE_PERMISSIONS,
        )

    def test_user_can_register(self):
        payload = {
            "username": "jane",
            "email": "jane@example.com",
            "first_name": "Jane",
            "last_name": "Doe",
            "phone_number": "0712345678",
            "role_id": self.role.id,
            "password": "S3curePass123",
            "password_confirm": "S3curePass123",
        }

        response = self.client.post(reverse("user-register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="jane").exists())
        user = User.objects.get(username="jane")
        self.assertEqual(user.role, self.role)
        self.assertTrue(AuditLog.objects.filter(path="/api/users/register/").exists())

    def test_user_can_login_and_fetch_profile(self):
        user = User.objects.create_user(
            username="john",
            email="john@example.com",
            password="S3curePass123",
            role=self.role,
        )

        login_response = self.client.post(
            reverse("token-obtain-pair"),
            {"username": "john", "password": "S3curePass123"},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )
        me_response = self.client.get(reverse("user-me"))

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["username"], user.username)
        self.assertEqual(me_response.data["role"]["code"], self.role.code)

    def test_role_permissions_are_serialized(self):
        self.assertIn(RolePermissionCodes.MANAGE_USERS, self.role.permissions)
