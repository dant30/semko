from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.users.models import Role

User = get_user_model()


class UserCRUDAPITests(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(
            name="System Administrator",
            code="system-administrator",
            permissions=[
                RolePermissionCodes.VIEW_USERS,
                RolePermissionCodes.MANAGE_USERS,
                RolePermissionCodes.VIEW_ROLES,
                RolePermissionCodes.MANAGE_ROLES,
                RolePermissionCodes.VIEW_AUDIT_LOGS,
            ],
            is_system=True,
        )
        self.viewer_role = Role.objects.create(
            name="Viewer",
            code="viewer",
            permissions=[RolePermissionCodes.VIEW_USERS],
        )
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="S3curePass123",
            role=self.admin_role,
            is_staff=True,
        )
        self.regular_user = User.objects.create_user(
            username="regular",
            email="regular@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_admin_can_create_list_update_and_deactivate_users(self):
        self.authenticate(self.admin_user)

        create_response = self.client.post(
            reverse("user-list-create"),
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "first_name": "New",
                "last_name": "User",
                "phone_number": "0700000000",
                "role_id": self.viewer_role.id,
                "is_active": True,
                "is_staff": False,
                "must_change_password": True,
                "password": "S3curePass123",
                "password_confirm": "S3curePass123",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        created_user_id = create_response.data["id"]

        list_response = self.client.get(reverse("user-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_response.data), 3)

        active_filtered = self.client.get(reverse("user-list-create"), {"active_only": "true"})
        self.assertEqual(active_filtered.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item["is_active"] for item in active_filtered.data))

        update_response = self.client.patch(
            reverse("user-detail", kwargs={"pk": created_user_id}),
            {"first_name": "Updated", "must_change_password": False},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["first_name"], "Updated")

        delete_response = self.client.delete(
            reverse("user-detail", kwargs={"pk": created_user_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.get(pk=created_user_id).is_active)

    def test_list_users_supports_search_filter(self):
        self.authenticate(self.admin_user)

        response = self.client.get(reverse("user-list-create"), {"search": "regular"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertTrue(any(user["username"] == "regular" for user in response.data))

    def test_view_only_user_cannot_manage_users(self):
        self.authenticate(self.regular_user)

        response = self.client.post(
            reverse("user-list-create"),
            {
                "username": "blocked",
                "email": "blocked@example.com",
                "password": "S3curePass123",
                "password_confirm": "S3curePass123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_manage_roles(self):
        self.authenticate(self.admin_user)

        create_response = self.client.post(
            reverse("role-list-create"),
            {
                "name": "Audit Manager",
                "code": "audit-manager",
                "description": "Can review audit records",
                "permissions": [RolePermissionCodes.VIEW_AUDIT_LOGS],
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        role_id = create_response.data["id"]

        update_response = self.client.patch(
            reverse("role-detail", kwargs={"pk": role_id}),
            {"description": "Updated role description"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["description"], "Updated role description")

    def test_cannot_delete_system_role(self):
        self.authenticate(self.admin_user)

        response = self.client.delete(
            reverse("role-detail", kwargs={"pk": self.admin_role.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_update_own_profile_from_me_endpoint(self):
        self.authenticate(self.regular_user)

        response = self.client.patch(
            reverse("user-me"),
            {"first_name": "Regular", "phone_number": "0711111111"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.first_name, "Regular")

    def test_user_can_get_own_profile(self):
        self.authenticate(self.regular_user)

        response = self.client.get(reverse("user-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.regular_user.email)

    def test_user_can_change_password_via_endpoint(self):
        self.authenticate(self.regular_user)

        response = self.client.patch(
            reverse("user-password-change"),
            {
                "old_password": "S3curePass123",
                "new_password": "NewS3curePass456",
                "new_password_confirm": "NewS3curePass456",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.check_password("NewS3curePass456"))

    def test_forgot_password_endpoint_is_noop_for_unknown_email(self):
        response = self.client.post(
            reverse("user-password-forgot"),
            {"email": "unknown@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_forgot_password_endpoint_sends_email_for_known_user(self):
        response = self.client.post(
            reverse("user-password-forgot"),
            {"email": "regular@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_reset_password_endpoint_works_with_valid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.regular_user.pk))
        token = default_token_generator.make_token(self.regular_user)

        response = self.client.post(
            reverse("user-password-reset"),
            {
                "uid": uid,
                "token": token,
                "new_password": "ResetS3curePass789",
                "new_password_confirm": "ResetS3curePass789",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.check_password("ResetS3curePass789"))

    def test_public_registration_disabled(self):
        response = self.client.post(
            reverse("user-register"),
            {
                "username": "selfreg",
                "email": "selfreg@example.com",
                "password": "S3curePass123",
                "password_confirm": "S3curePass123",
            },
            format="json",
        )

        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])
