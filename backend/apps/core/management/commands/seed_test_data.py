import random
import uuid
from decimal import Decimal
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q

from apps.users.models import Role
from apps.stores.models import (
    Supplier,
    Item,
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseOrderStatus,
    StockReceiving,
    Requisition,
    StockIssue,
    Adjustment,
)
from apps.core.constants import RolePermissionCodes

User = get_user_model()

# Helper to generate unique reference numbers (low collision probability)
def unique_ref(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

class Command(BaseCommand):
    help = "Seeds test data for stores, users, and related models."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Delete existing data before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        # Early exit if data exists and --force not provided
        if not options["force"]:
            if (Item.objects.exists() or PurchaseOrder.objects.exists() or 
                Requisition.objects.exists() or StockReceiving.objects.exists() or
                StockIssue.objects.exists() or Adjustment.objects.exists()):
                self.stdout.write(
                    self.style.WARNING(
                        "⚠️  Existing data detected. Run with --force flag to delete before seeding:\n"
                        "   python manage.py seed_test_data --force"
                    )
                )
                return  # exit early to prevent duplication

        if options["force"]:
            self.stdout.write("Deleting existing data...")
            self._delete_all_data()

        self.stdout.write("Creating test data...")

        try:
            # 1. Create roles
            admin_permissions = [
                value for key, value in RolePermissionCodes.__dict__.items()
                if key.isupper() and isinstance(value, str)
            ]
            admin_role = self._create_role(
                "Admin", "admin", admin_permissions, is_system=True,
            )
            manager_role = self._create_role(
                "Store Manager", "store_manager",
                [RolePermissionCodes.VIEW_STORES, RolePermissionCodes.MANAGE_STORES],
            )
            clerk_role = self._create_role(
                "Store Clerk", "store_clerk",
                [RolePermissionCodes.VIEW_STORES, RolePermissionCodes.MANAGE_STORES],
            )

            # 2. Create users
            self._create_user(
                username="admin", email="admin@example.com", password="admin123",
                role=admin_role, is_staff=True, is_superuser=True,
            )
            self._create_user(
                username="manager", email="manager@example.com", password="manager123",
                role=manager_role, is_staff=True,
            )
            self._create_user(
                username="clerk", email="clerk@example.com", password="clerk123",
                role=clerk_role,
            )

            # 3. Create suppliers
            suppliers = []
            for name in ["ABC Supplies", "XYZ Traders", "Global Parts Ltd"]:
                sup = Supplier.objects.create(
                    name=name,
                    contact_name=f"Contact {name}",
                    email=f"info@{name.replace(' ', '').lower()}.com",
                    phone=f"+12345678{random.randint(100, 999)}",
                    address=f"123 {name} Street",
                )
                suppliers.append(sup)

            # 4. Create items
            items_data = [
                {"name": "Brake Pad", "code": "BP-001", "category": Item.ItemCategory.SPARE_PART,
                 "unit_of_measure": Item.UnitOfMeasure.PIECE, "description": "High quality brake pad",
                 "reorder_level": 20, "standard_issue_quantity": 4},
                {"name": "Engine Oil 5W-30", "code": "EO-001", "category": Item.ItemCategory.LUBRICANT,
                 "unit_of_measure": Item.UnitOfMeasure.LITRE, "description": "Synthetic engine oil",
                 "reorder_level": 50, "standard_issue_quantity": 5},
                {"name": "Air Filter", "code": "AF-001", "category": Item.ItemCategory.SPARE_PART,
                 "unit_of_measure": Item.UnitOfMeasure.PIECE, "description": "Engine air filter",
                 "reorder_level": 15, "standard_issue_quantity": 1},
                {"name": "Wheel Bolt", "code": "WB-001", "category": Item.ItemCategory.SPARE_PART,
                 "unit_of_measure": Item.UnitOfMeasure.PIECE, "description": "Steel wheel bolt",
                 "reorder_level": 100, "standard_issue_quantity": 5},
                {"name": "Tyre 205/55R16", "code": "TY-001", "category": Item.ItemCategory.TYRE,
                 "unit_of_measure": Item.UnitOfMeasure.PIECE, "description": "All-season tyre",
                 "reorder_level": 8, "standard_issue_quantity": 2},
                {"name": "Workshop Gloves", "code": "GL-001", "category": Item.ItemCategory.CONSUMABLE,
                 "unit_of_measure": Item.UnitOfMeasure.PIECE, "description": "Heavy duty gloves",
                 "reorder_level": 30, "standard_issue_quantity": 10},
            ]
            items = []
            for data in items_data:
                item = Item.objects.create(**data, is_active=True)
                items.append(item)

            # 5. Create purchase orders
            po_list = []
            for i, supplier in enumerate(suppliers):
                po = PurchaseOrder.objects.create(
                    supplier=supplier,
                    reference_no=unique_ref(f"PO-{i+1}"),
                    order_date=date.today() - timedelta(days=random.randint(1, 30)),
                    expected_date=date.today() + timedelta(days=random.randint(5, 15)),
                    status=PurchaseOrderStatus.APPROVED,
                    is_active=True,
                )
                po_list.append(po)

                # Add 2 unique items per PO
                num_lines = min(2, len(items))
                selected_items = random.sample(items, num_lines)
                for item in selected_items:
                    ordered_qty = Decimal(random.randint(10, 100))
                    line = PurchaseOrderLine.objects.create(
                        purchase_order=po,
                        item=item,
                        ordered_quantity=ordered_qty,
                        unit_cost=Decimal(str(random.randint(10, 500))) / 10,
                    )

            # 6. Create stock receivings (linked to PO lines and direct)
            for po in po_list:
                for line in po.lines.all():
                    received_qty = line.ordered_quantity * Decimal(str(random.uniform(0.6, 1.0)))
                    received_qty = received_qty.quantize(Decimal("0.01"))
                    if received_qty > 0:
                        StockReceiving.objects.create(
                            item=line.item,
                            purchase_order=po,
                            purchase_order_line=line,
                            reference_no=unique_ref("REC-PO"),
                            received_date=po.order_date + timedelta(days=random.randint(1, 10)),
                            quantity=received_qty,
                            unit_cost=line.unit_cost,
                            supplier_name=po.supplier.name,
                            notes=f"Receiving for PO {po.reference_no}",
                            is_active=True,
                        )
                        line.received_quantity += received_qty
                        line.save()

            for _ in range(5):
                item = random.choice(items)
                qty = Decimal(random.randint(5, 50))
                StockReceiving.objects.create(
                    item=item,
                    reference_no=unique_ref("REC-DIR"),
                    received_date=date.today() - timedelta(days=random.randint(1, 20)),
                    quantity=qty,
                    unit_cost=Decimal(str(random.randint(10, 200))) / 10,
                    supplier_name=random.choice(suppliers).name,
                    notes="Direct receiving without PO",
                    is_active=True,
                )

            # 7. Create requisitions
            requisitions = []
            requesting_user = User.objects.filter(is_staff=True).first() or User.objects.first()
            for _ in range(10):
                item = random.choice(items)
                qty_requested = Decimal(random.randint(1, 30))
                status = random.choice([
                    Requisition.RequisitionStatus.DRAFT,
                    Requisition.RequisitionStatus.PENDING_APPROVAL,
                    Requisition.RequisitionStatus.APPROVED,
                    Requisition.RequisitionStatus.PARTIALLY_ISSUED,
                    Requisition.RequisitionStatus.FULFILLED,
                    Requisition.RequisitionStatus.REJECTED,
                    Requisition.RequisitionStatus.CANCELLED,
                ])
                quantity_approved = None
                if status in [
                    Requisition.RequisitionStatus.APPROVED,
                    Requisition.RequisitionStatus.PARTIALLY_ISSUED,
                    Requisition.RequisitionStatus.FULFILLED,
                ]:
                    quantity_approved = qty_requested * Decimal(str(random.uniform(0.5, 1.0)))
                    quantity_approved = quantity_approved.quantize(Decimal("0.01"))
                req = Requisition.objects.create(
                    item=item,
                    reference_no=unique_ref("REQ"),
                    requested_by=requesting_user,
                    requested_for=f"Department {random.randint(1,5)}",
                    quantity_requested=qty_requested,
                    quantity_approved=quantity_approved,
                    quantity_issued=0,
                    status=status,
                    needed_by=date.today() + timedelta(days=random.randint(1, 30)),
                    notes="Test requisition",
                    is_active=True,
                )
                requisitions.append(req)

            # 8. Create stock issues
            for req in requisitions:
                if req.status in [
                    Requisition.RequisitionStatus.APPROVED,
                    Requisition.RequisitionStatus.PARTIALLY_ISSUED,
                    Requisition.RequisitionStatus.FULFILLED,
                ] and req.quantity_approved:
                    issue_qty = req.quantity_approved * Decimal(str(random.uniform(0.5, 1.0)))
                    issue_qty = issue_qty.quantize(Decimal("0.01"))
                    if issue_qty > 0:
                        StockIssue.objects.create(
                            item=req.item,
                            requisition=req,
                            reference_no=unique_ref("ISS"),
                            issue_date=date.today() - timedelta(days=random.randint(1, 10)),
                            quantity=issue_qty,
                            unit_cost=Decimal(str(random.randint(10, 300))) / 10,
                            issued_to_type=random.choice([t[0] for t in StockIssue.IssuedToType.choices]),
                            issued_to_name=f"Recipient {random.randint(1,10)}",
                            purpose="Maintenance",
                            notes="Issued from requisition",
                            is_active=True,
                        )
                        req.quantity_issued += issue_qty
                        if req.quantity_issued >= req.quantity_approved:
                            req.status = Requisition.RequisitionStatus.FULFILLED
                        elif req.quantity_issued > 0:
                            req.status = Requisition.RequisitionStatus.PARTIALLY_ISSUED
                        req.save()

            for _ in range(5):
                item = random.choice(items)
                qty = Decimal(random.randint(1, 10))
                StockIssue.objects.create(
                    item=item,
                    reference_no=unique_ref("ISS-DIR"),
                    issue_date=date.today() - timedelta(days=random.randint(1, 15)),
                    quantity=qty,
                    unit_cost=Decimal(str(random.randint(10, 300))) / 10,
                    issued_to_type=random.choice([t[0] for t in StockIssue.IssuedToType.choices]),
                    issued_to_name=f"Direct {random.randint(1,10)}",
                    purpose="Emergency use",
                    notes="Direct issue without requisition",
                    is_active=True,
                )

            # 9. Create adjustments
            for _ in range(5):
                item = random.choice(items)
                adj_type = random.choice([Adjustment.AdjustmentType.INCREASE, Adjustment.AdjustmentType.DECREASE])
                qty = Decimal(random.randint(1, 20))
                if adj_type == Adjustment.AdjustmentType.DECREASE:
                    # Calculate current stock using optimized aggregation
                    agg = item.receivings.aggregate(total=Sum("quantity"))["total"] or 0
                    issued = item.issues.aggregate(total=Sum("quantity"))["total"] or 0
                    inc_adj = item.adjustments.filter(
                        adjustment_type=Adjustment.AdjustmentType.INCREASE
                    ).aggregate(total=Sum("quantity"))["total"] or 0
                    dec_adj = item.adjustments.filter(
                        adjustment_type=Adjustment.AdjustmentType.DECREASE
                    ).aggregate(total=Sum("quantity"))["total"] or 0
                    current_stock = Decimal(agg) + Decimal(inc_adj) - Decimal(issued) - Decimal(dec_adj)
                    if current_stock < qty:
                        continue  # skip this adjustment to avoid negative stock
                Adjustment.objects.create(
                    item=item,
                    reference_no=unique_ref("ADJ"),
                    adjustment_date=date.today() - timedelta(days=random.randint(1, 10)),
                    adjustment_type=adj_type,
                    quantity=qty,
                    reason=f"Count adjustment: {random.choice(['found extra', 'lost', 'damaged'])}",
                    notes="Test adjustment",
                    is_active=True,
                )

            self.stdout.write(self.style.SUCCESS("Test data seeded successfully."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Seeding failed: {e}"))
            raise  # re-raise so transaction rolls back

    def _create_role(self, name, code, permissions, is_system=False):
        role, created = Role.objects.get_or_create(
            code=code,
            defaults={
                "name": name,
                "permissions": permissions,
                "is_system": is_system,
            },
        )
        if not created:
            role.name = name
            role.permissions = permissions
            role.is_system = is_system
            role.save()
        return role

    def _create_user(self, username, email, password, role=None, is_staff=False, is_superuser=False):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "role": role,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
            },
        )
        if created:
            user.set_password(password)
            user.save()
        else:
            user.email = email
            user.role = role
            user.is_staff = is_staff
            user.is_superuser = is_superuser
            user.save()
        return user

    def _delete_all_data(self):
        # Delete in order to respect foreign keys
        Adjustment.objects.all().delete()
        StockIssue.objects.all().delete()
        Requisition.objects.all().delete()
        StockReceiving.objects.all().delete()
        PurchaseOrderLine.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Item.objects.all().delete()
        Supplier.objects.all().delete()
        # Delete non-superuser users (keep system superusers)
        User.objects.exclude(is_superuser=True).delete()
        # Delete non-system roles
        Role.objects.exclude(is_system=True).delete()