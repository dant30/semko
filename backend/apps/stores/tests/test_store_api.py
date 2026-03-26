from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import RolePermissionCodes
from apps.stores.models import (
    Adjustment,
    Item,
    PurchaseOrder,
    PurchaseOrderLine,
    Requisition,
    StockReceiving,
    Supplier,
)
from apps.users.models import Role

User = get_user_model()


class StoreAPITests(APITestCase):
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

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_item_and_receiving_and_see_stock_snapshot(self):
        self.authenticate(self.manager)

        item_response = self.client.post(
            reverse("store-item-list-create"),
            {
                "name": "Oil Filter",
                "code": "oil-filter",
                "category": "spare_part",
                "unit_of_measure": "piece",
                "description": "Heavy-duty oil filter",
                "reorder_level": "10.00",
                "standard_issue_quantity": "2.00",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(item_response.status_code, status.HTTP_201_CREATED)
        item_id = item_response.data["id"]

        receiving_response = self.client.post(
            reverse("store-receiving-list-create"),
            {
                "item_id": item_id,
                "reference_no": "GRN-001",
                "received_date": "2026-03-19",
                "quantity": "25.00",
                "unit_cost": "1200.00",
                "supplier_name": "Parts Depot",
                "notes": "Initial stock",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(receiving_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get(
            reverse("store-item-list-create"),
            {"search": "Oil", "active_only": "true"},
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(str(list_response.data[0]["stock_on_hand"]), "25.00")
        self.assertFalse(list_response.data[0]["is_below_reorder_level"])

        reorder_list_response = self.client.get(
            reverse("store-item-list-create"),
            {"reorder_only": "true"},
        )
        self.assertEqual(reorder_list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reorder_list_response.data), 0)

    def test_manager_can_process_requisition_issue_workflow(self):
        self.authenticate(self.manager)
        item = Item.objects.create(
            name="Grease Cartridge",
            code="grease-cartridge",
            category=Item.ItemCategory.LUBRICANT,
            unit_of_measure=Item.UnitOfMeasure.PIECE,
            reorder_level="5.00",
            is_active=True,
        )
        StockReceiving.objects.create(
            item=item,
            reference_no="GRN-002",
            received_date="2026-03-19",
            quantity="10.00",
            supplier_name="Depot A",
            is_active=True,
        )

        requisition_response = self.client.post(
            reverse("store-requisition-list-create"),
            {
                "item_id": item.id,
                "reference_no": "REQ-001",
                "requested_for": "Workshop Team",
                "quantity_requested": "6.00",
                "status": "pending_approval",
                "notes": "Routine service issue",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(requisition_response.status_code, status.HTTP_201_CREATED)
        requisition_id = requisition_response.data["id"]

        approve_response = self.client.patch(
            reverse("store-requisition-detail", kwargs={"pk": requisition_id}),
            {
                "status": "approved",
                "quantity_approved": "6.00",
            },
            format="json",
        )
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)

        first_issue = self.client.post(
            reverse("store-issue-list-create"),
            {
                "item_id": item.id,
                "requisition_id": requisition_id,
                "reference_no": "ISS-001",
                "issue_date": "2026-03-19",
                "quantity": "4.00",
                "issued_to_type": "workshop",
                "issued_to_name": "Main Workshop",
                "purpose": "Service work",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(first_issue.status_code, status.HTTP_201_CREATED)

        second_issue = self.client.post(
            reverse("store-issue-list-create"),
            {
                "item_id": item.id,
                "requisition_id": requisition_id,
                "reference_no": "ISS-002",
                "issue_date": "2026-03-19",
                "quantity": "2.00",
                "issued_to_type": "workshop",
                "issued_to_name": "Main Workshop",
                "purpose": "Balance issue",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(second_issue.status_code, status.HTTP_201_CREATED)

        requisition = Requisition.objects.get(pk=requisition_id)
        item_detail = self.client.get(
            reverse("store-item-detail", kwargs={"pk": item.id})
        )

        self.assertEqual(requisition.status, Requisition.RequisitionStatus.FULFILLED)
        self.assertEqual(str(requisition.quantity_issued), "6.00")
        self.assertEqual(str(item_detail.data["stock_on_hand"]), "4.00")

    def test_viewer_can_list_but_cannot_create_item(self):
        self.authenticate(self.viewer)
        list_response = self.client.get(reverse("store-item-list-create"))
        create_response = self.client.post(
            reverse("store-item-list-create"),
            {
                "name": "Brake Pad",
                "code": "brake-pad",
                "category": "spare_part",
                "unit_of_measure": "set",
                "reorder_level": "4.00",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_create_decrease_adjustment_above_available_stock(self):
        self.authenticate(self.manager)
        item = Item.objects.create(
            name="Hydraulic Oil",
            code="hydraulic-oil",
            category=Item.ItemCategory.LUBRICANT,
            unit_of_measure=Item.UnitOfMeasure.LITRE,
            reorder_level="20.00",
            is_active=True,
        )
        StockReceiving.objects.create(
            item=item,
            reference_no="GRN-003",
            received_date="2026-03-19",
            quantity="15.00",
            supplier_name="Lubricants Ltd",
            is_active=True,
        )

        response = self.client.post(
            reverse("store-adjustment-list-create"),
            {
                "item_id": item.id,
                "reference_no": "ADJ-001",
                "adjustment_date": "2026-03-19",
                "adjustment_type": Adjustment.AdjustmentType.DECREASE,
                "quantity": "20.00",
                "reason": "Stock count correction",
                "notes": "Attempted over-adjustment",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

    def test_purchase_order_and_po_line_and_receiving_workflow(self):
        self.authenticate(self.manager)

        supplier = Supplier.objects.create(name="Parts Source", contact_name="Procurement")

        po_response = self.client.post(
            reverse("store-purchase-order-list-create"),
            {
                "supplier": supplier.id,
                "reference_no": "LPO-001",
                "order_date": "2026-03-19",
                "expected_date": "2026-03-28",
                "status": "approved",
                "notes": "Primary purchase order",
                "is_active": True,
                "line_items": [
                    {
                        "item_id": Item.objects.create(
                            name="Bolt",
                            code="bolt-16",
                            category=Item.ItemCategory.SPARE_PART,
                            unit_of_measure=Item.UnitOfMeasure.PIECE,
                            reorder_level="100.00",
                            is_active=True,
                        ).id,
                        "ordered_quantity": "500.00",
                        "unit_cost": "1.50",
                        "is_active": True,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(po_response.status_code, status.HTTP_201_CREATED)
        po_id = po_response.data["id"]
        line = PurchaseOrderLine.objects.get(purchase_order_id=po_id)

        receiving_response = self.client.post(
            reverse("store-receiving-list-create"),
            {
                "item_id": line.item.id,
                "purchase_order": po_id,
                "purchase_order_line": line.id,
                "reference_no": "GRN-PO-001",
                "received_date": "2026-03-20",
                "quantity": "250.00",
                "unit_cost": "1.50",
                "supplier_name": "Parts Source",
                "notes": "Half of PO line received",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(receiving_response.status_code, status.HTTP_201_CREATED)

        line.refresh_from_db()
        self.assertEqual(str(line.received_quantity), "250.00")

        over_receive_response = self.client.post(
            reverse("store-receiving-list-create"),
            {
                "item_id": line.item.id,
                "purchase_order": po_id,
                "purchase_order_line": line.id,
                "reference_no": "GRN-PO-002",
                "received_date": "2026-03-21",
                "quantity": "300.00",
                "unit_cost": "1.50",
                "supplier_name": "Parts Source",
                "notes": "Too many",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(over_receive_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", over_receive_response.data)

    def test_supplier_list_and_purchase_order_filter_pagination(self):
        self.authenticate(self.manager)

        supplier_a = Supplier.objects.create(name="Supplier A", contact_name="Procurement")
        supplier_b = Supplier.objects.create(name="Supplier B", contact_name="Procurement")

        for i in range(1, 14):
            PurchaseOrder.objects.create(
                supplier=supplier_a if i % 2 else supplier_b,
                reference_no=f"LPO-{i:03d}",
                order_date=f"2026-03-{i:02d}",
                status="approved" if i % 3 else "pending_approval",
                notes="Test PO",
                is_active=True,
            )

        supplier_resp = self.client.get(reverse("store-supplier-list"))
        self.assertEqual(supplier_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == supplier_a.id for item in supplier_resp.data))

        po_resp_page1 = self.client.get(reverse("store-purchase-order-list-create"), {"page": 1, "page_size": 5})
        self.assertEqual(po_resp_page1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(po_resp_page1.data.get("results", [])), 5)

        po_resp_supplier = self.client.get(
            reverse("store-purchase-order-list-create"),
            {"supplier_id": supplier_b.id, "page": 1, "page_size": 50},
        )
        self.assertEqual(po_resp_supplier.status_code, status.HTTP_200_OK)
        self.assertTrue(all(po["supplier"] == supplier_b.id for po in po_resp_supplier.data.get("results", [])))

        po_resp_date = self.client.get(
            reverse("store-purchase-order-list-create"),
            {"order_date_from": "2026-03-05", "order_date_to": "2026-03-10", "page": 1, "page_size": 50},
        )
        self.assertEqual(po_resp_date.status_code, status.HTTP_200_OK)
        self.assertTrue(all("2026-03-05" <= po["order_date"] <= "2026-03-10" for po in po_resp_date.data.get("results", [])))

