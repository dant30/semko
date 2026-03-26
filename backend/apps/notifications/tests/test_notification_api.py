from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.notifications.models import Notification, NotificationPreference, NotificationTemplate
from apps.notifications.services.notification_service import dispatch_notification_event
from apps.users.models import Role

User = get_user_model()


class NotificationAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Notification Manager",
            code="notification-manager",
            permissions=[
                RolePermissionCodes.VIEW_NOTIFICATIONS,
                RolePermissionCodes.MANAGE_NOTIFICATIONS,
            ],
        )
        self.driver_role = Role.objects.create(
            name="Driver Portal",
            code="driver-portal",
            permissions=[RolePermissionCodes.VIEW_OWN_PAYSLIP],
        )
        self.finance_role = Role.objects.create(
            name="Finance Officer",
            code="finance-officer",
            permissions=[RolePermissionCodes.VIEW_PAYROLL],
        )
        self.manager = User.objects.create_user(
            username="notif-manager",
            email="notif-manager@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.user = User.objects.create_user(
            username="notif-user",
            email="notif-user@example.com",
            password="S3curePass123",
            role=self.driver_role,
            phone_number="0712345678",
        )
        self.finance_user = User.objects.create_user(
            username="finance-user",
            email="finance@example.com",
            password="S3curePass123",
            role=self.finance_role,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_manage_notification_templates(self):
        self.authenticate(self.manager)

        response = self.client.post(
            reverse("notification-template-list-create"),
            {
                "event_code": "payroll.test_event",
                "audience": "finance",
                "channel": "email",
                "title_template": "Finance Title {payroll_period_name}",
                "body_template": "Finance Body {payroll_period_name}",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            NotificationTemplate.objects.filter(
                event_code="payroll.test_event",
                audience="finance",
                channel="email",
            ).exists()
        )

    def test_regular_user_can_manage_only_own_preferences(self):
        self.authenticate(self.user)

        response = self.client.post(
            reverse("notification-preference-list-create"),
            {
                "user": self.manager.id,
                "role": self.manager_role.id,
                "channel": "sms",
                "event_code": "payroll.payslip_ready",
                "is_enabled": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        preference = NotificationPreference.objects.get(pk=response.data["id"])
        self.assertEqual(preference.user, self.user)
        self.assertIsNone(preference.role)

    def test_dispatch_notification_event_creates_async_delivery_logs(self):
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.period_locked",
            audience="finance",
            channel=Notification.Channel.EMAIL,
            defaults={
                "title_template": "Finance Email {payroll_period_name}",
                "body_template": "Locked {payroll_period_name}",
                "is_active": True,
            },
        )
        NotificationTemplate.objects.update_or_create(
            event_code="payroll.period_locked",
            audience="general",
            channel=Notification.Channel.IN_APP,
            defaults={
                "title_template": "General {payroll_period_name}",
                "body_template": "General body {payroll_period_name}",
                "is_active": True,
            },
        )
        NotificationPreference.objects.create(
            role=self.finance_role,
            channel=Notification.Channel.EMAIL,
            event_code="payroll.period_locked",
            is_enabled=True,
        )

        dispatch_notification_event(
            event_code="payroll.period_locked",
            category=Notification.Category.PAYROLL,
            recipients=[self.finance_user],
            context={"payroll_period_name": "March 2026"},
            fallback_title="Fallback",
            fallback_message="Fallback",
        )

        email_notification = Notification.objects.get(
            recipient=self.finance_user,
            channel=Notification.Channel.EMAIL,
        )
        self.assertEqual(email_notification.title, "Finance Email March 2026")
        self.assertTrue(
            email_notification.logs.filter(status="queued", channel=Notification.Channel.EMAIL).exists()
        )
        self.assertTrue(
            email_notification.logs.filter(status="delivered", channel=Notification.Channel.EMAIL).exists()
        )

    def test_notif_list_archived_and_summary_endpoints(self):
        self.authenticate(self.user)

        Notification.objects.create(
            recipient=self.user,
            title="User unread",
            message="unread message",
            category=Notification.Category.OTHER,
            channel=Notification.Channel.IN_APP,
            event_code="user.created",
            audience="general",
            is_read=False,
        )
        Notification.objects.create(
            recipient=self.user,
            title="User read",
            message="read message",
            category=Notification.Category.OTHER,
            channel=Notification.Channel.IN_APP,
            event_code="user.created",
            audience="general",
            is_read=True,
            read_at=timezone.now(),
        )
        Notification.objects.create(
            recipient=self.user,
            title="User archived",
            message="archived message",
            category=Notification.Category.OTHER,
            channel=Notification.Channel.IN_APP,
            event_code="user.created",
            audience="general",
            is_archived=True,
            archived_at=timezone.now(),
        )

        list_response = self.client.get(reverse("notification-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        list_data = list_response.data.get("results", list_response.data)
        self.assertEqual(len(list_data), 2)

        archived_response = self.client.get(reverse("notification-archived-list"))
        self.assertEqual(archived_response.status_code, status.HTTP_200_OK)
        archived_data = archived_response.data.get("results", archived_response.data)
        self.assertEqual(len(archived_data), 1)

        summary_response = self.client.get(reverse("notification-summary"))
        self.assertEqual(summary_response.status_code, status.HTTP_200_OK)
        self.assertEqual(summary_response.data["total_unread"], 1)
        self.assertEqual(summary_response.data["total_read"], 1)
        self.assertEqual(summary_response.data["total_archived"], 1)

    def test_bulk_mark_and_archive_and_delete(self):
        self.authenticate(self.user)

        n1 = Notification.objects.create(
            recipient=self.user,
            title="bulk 1",
            message="bulk message 1",
            category=Notification.Category.OTHER,
            channel=Notification.Channel.IN_APP,
            event_code="user.created",
            audience="general",
            is_read=False,
        )
        n2 = Notification.objects.create(
            recipient=self.user,
            title="bulk 2",
            message="bulk message 2",
            category=Notification.Category.OTHER,
            channel=Notification.Channel.IN_APP,
            event_code="user.created",
            audience="general",
            is_read=False,
        )

        mark_read_resp = self.client.post(
            reverse("notification-bulk-mark-read"),
            {"notification_ids": [n1.id, n2.id]},
            format="json",
        )
        self.assertEqual(mark_read_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_read_resp.data["updated_count"], 2)

        mark_archived_resp = self.client.post(
            reverse("notification-bulk-mark-archived"),
            {"notification_ids": [n1.id, n2.id]},
            format="json",
        )
        self.assertEqual(mark_archived_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_archived_resp.data["updated_count"], 2)

        delete_resp = self.client.post(
            reverse("notification-bulk-delete"),
            {"notification_ids": [n1.id, n2.id]},
            format="json",
        )
        self.assertEqual(delete_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_resp.data["deleted_count"], 2)

