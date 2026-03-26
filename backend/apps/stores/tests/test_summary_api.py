from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.stores.models import Item, StockReceiving, Requisition, StockIssue, Adjustment, PurchaseOrder, Supplier
from apps.users.models import Role

User = get_user_model()


class StoresSummaryAPITests(APITestCase):
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

        # Create test data
        self.supplier = Supplier.objects.create(
            name="Test Supplier",
            contact_name="Test Contact",
            email="test@supplier.com",
            is_active=True,
        )

        # Create items
        self.item1 = Item.objects.create(
            name="Item 1",
            code="ITEM-001",
            category="spare_part",
            unit_of_measure="piece",
            reorder_level=10,
            is_active=True,
        )
        self.item2 = Item.objects.create(
            name="Item 2",
            code="ITEM-002",
            category="consumable",
            unit_of_measure="litre",
            reorder_level=5,
            is_active=False,
        )

        # Create stock receiving
        StockReceiving.objects.create(
            item=self.item1,
            reference_no="REC-001",
            received_date="2026-03-20",
            quantity=50,
            supplier_name="Test Supplier",
            is_active=True,
        )
        StockReceiving.objects.create(
            item=self.item1,
            reference_no="REC-002",
            received_date="2026-03-21",
            quantity=30,
            supplier_name="Test Supplier",
            is_active=True,
        )

        # Create requisitions
        Requisition.objects.create(
            item=self.item1,
            reference_no="REQ-001",
            requested_for="Department A",
            quantity_requested=10,
            quantity_approved=10,
            quantity_issued=0,
            status=Requisition.RequisitionStatus.APPROVED,
            is_active=True,
        )
        Requisition.objects.create(
            item=self.item1,
            reference_no="REQ-002",
            requested_for="Department B",
            quantity_requested=5,
            quantity_approved=None,
            quantity_issued=0,
            status=Requisition.RequisitionStatus.PENDING_APPROVAL,
            is_active=True,
        )

        # Create stock issues
        StockIssue.objects.create(
            item=self.item1,
            reference_no="ISS-001",
            issue_date="2026-03-22",
            quantity=20,
            issued_to_type="driver",
            issued_to_name="Driver A",
            is_active=True,
        )

        # Create adjustments
        Adjustment.objects.create(
            item=self.item1,
            reference_no="ADJ-001",
            adjustment_date="2026-03-23",
            adjustment_type="decrease",
            quantity=5,
            reason="Damage",
            is_active=True,
        )

        # Create purchase order
        PurchaseOrder.objects.create(
            supplier=self.supplier,
            reference_no="PO-001",
            order_date="2026-03-20",
            status="draft",
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_viewer_can_access_summary(self):
        self.authenticate(self.viewer)
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_summary_returns_all_metrics(self):
        self.authenticate(self.viewer)
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn("activeItems", data)
        self.assertIn("belowReorder", data)
        self.assertIn("totalStockOnHand", data)
        self.assertIn("totalReceivings", data)
        self.assertIn("totalIssues", data)
        self.assertIn("pendingRequisitions", data)
        self.assertIn("pendingAdjustments", data)
        self.assertIn("pendingPurchaseOrders", data)

    def test_summary_metrics_are_correct(self):
        self.authenticate(self.viewer)
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data

        # activeItems: only active items (item1=True, item2=False) = 1
        self.assertEqual(data["activeItems"], 1)

        # totalReceivings: 50 + 30 = 80
        self.assertEqual(data["totalReceivings"], 80)

        # totalIssues: 20
        self.assertEqual(data["totalIssues"], 20)

        # pendingRequisitions: APPROVED + PENDING_APPROVAL = 2
        self.assertEqual(data["pendingRequisitions"], 2)

        # pendingAdjustments: 1
        self.assertEqual(data["pendingAdjustments"], 1)

        # pendingPurchaseOrders: draft status = 1
        self.assertEqual(data["pendingPurchaseOrders"], 1)

    def test_summary_handles_empty_data(self):
        """Test that summary returns zeros when no data exists."""
        # Create new user and objects for clean test
        new_manager_role = Role.objects.create(
            name="Clean Manager",
            code="clean-manager",
            permissions=[RolePermissionCodes.VIEW_STORES],
        )
        clean_user = User.objects.create_user(
            username="clean-user",
            email="clean@example.com",
            password="CleanPass123",
            role=new_manager_role,
        )

        # Delete all items and related data
        Item.objects.all().delete()
        StockReceiving.objects.all().delete()
        Requisition.objects.all().delete()
        StockIssue.objects.all().delete()
        Adjustment.objects.all().delete()
        PurchaseOrder.objects.all().delete()

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {str(RefreshToken.for_user(clean_user).access_token)}"
        )
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data["activeItems"], 0)
        self.assertEqual(data["totalReceivings"], 0)
        self.assertEqual(data["totalIssues"], 0)
        self.assertEqual(data["pendingRequisitions"], 0)

    def test_summary_excludes_inactive_transactions(self):
        """Test that summary ignores inactive records."""
        # Create inactive records
        StockReceiving.objects.create(
            item=self.item1,
            reference_no="REC-INACTIVE",
            received_date="2026-03-20",
            quantity=100,
            supplier_name="Test Supplier",
            is_active=False,
        )
        StockIssue.objects.create(
            item=self.item1,
            reference_no="ISS-INACTIVE",
            issue_date="2026-03-22",
            quantity=50,
            issued_to_type="driver",
            issued_to_name="Driver X",
            is_active=False,
        )

        self.authenticate(self.viewer)
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        # totalReceivings should be 80 (inactive 100 not counted)
        self.assertEqual(data["totalReceivings"], 80)
        # totalIssues should be 20 (inactive 50 not counted)
        self.assertEqual(data["totalIssues"], 20)

    def test_unauthorized_user_cannot_access_summary(self):
        """Test that user without VIEW_STORES permission cannot access summary."""
        no_role = Role.objects.create(
            name="Guest",
            code="guest",
            permissions=[],
        )
        guest_user = User.objects.create_user(
            username="guest",
            email="guest@example.com",
            password="GuestPass123",
            role=no_role,
        )
        self.authenticate(guest_user)
        response = self.client.get(reverse("store-summary"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
