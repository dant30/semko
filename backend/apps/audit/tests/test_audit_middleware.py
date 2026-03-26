from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.models import AuditLog
from apps.core.constants import RolePermissionCodes
from apps.users.models import Role

User = get_user_model()


class AuditMiddlewareTests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name="Supervisor",
            code="supervisor",
            permissions=[RolePermissionCodes.VIEW_AUDIT_LOGS],
        )
        self.user = User.objects.create_user(
            username="audited-user",
            email="audit@example.com",
            password="S3curePass123",
            role=self.role,
        )

    def test_jwt_authenticated_request_is_logged_with_actor(self):
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(reverse("user-me"))

        self.assertEqual(response.status_code, 200)
        audit_log = AuditLog.objects.filter(path="/api/users/me/").first()
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.actor, self.user)
        self.assertEqual(audit_log.action, AuditLog.Action.READ)

    def test_admin_can_view_audit_logs(self):
        AuditLog.objects.create(
            actor=self.user,
            action=AuditLog.Action.READ,
            method="GET",
            path="/api/users/me/",
            status_code=200,
        )
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(reverse("audit-log-list"))

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)
