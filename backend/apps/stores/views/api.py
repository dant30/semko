from django.db.models import Q, Sum
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.stores.models import (
    Adjustment,
    Item,
    PurchaseOrder,
    PurchaseOrderLine,
    Requisition,
    StockIssue,
    StockReceiving,
    Supplier,
)
from apps.stores.serializers import (
    AdjustmentSerializer,
    AdjustmentWriteSerializer,
    ItemReadSerializer,
    ItemWriteSerializer,
    PurchaseOrderLineSerializer,
    PurchaseOrderLineWriteSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderWriteSerializer,
    RequisitionSerializer,
    RequisitionWriteSerializer,
    StockIssueSerializer,
    StockIssueWriteSerializer,
    StockReceivingSerializer,
    StockReceivingWriteSerializer,
    SupplierSerializer,
    SupplierWriteSerializer,
)
from apps.stores.services.stock_level import get_item_stock_snapshot


class ItemListCreateAPIView(generics.ListCreateAPIView):
    queryset = Item.objects.with_stock_snapshot().prefetch_related(
        "receivings",
        "issues",
        "adjustments",
    ).order_by("name")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ItemWriteSerializer
        return ItemReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        active_only = self.request.query_params.get("active_only")
        reorder_only = self.request.query_params.get("reorder_only")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(code__icontains=search)
                | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        if reorder_only == "true":
            queryset = queryset.filter(is_below_reorder_level=True)
        return queryset


class ItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.with_stock_snapshot().prefetch_related("receivings", "issues", "adjustments")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return ItemWriteSerializer
        return ItemReadSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockReceivingListCreateAPIView(generics.ListCreateAPIView):
    queryset = StockReceiving.objects.select_related("item").order_by(
        "-received_date",
        "-created_at",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StockReceivingWriteSerializer
        return StockReceivingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get("item_id")
        supplier_name = self.request.query_params.get("supplier_name")
        active_only = self.request.query_params.get("active_only")
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        if supplier_name:
            queryset = queryset.filter(supplier_name__icontains=supplier_name)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class StockReceivingDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockReceiving.objects.select_related("item")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return StockReceivingWriteSerializer
        return StockReceivingSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RequisitionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Requisition.objects.select_related("item", "requested_by").order_by(
        "-created_at"
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RequisitionWriteSerializer
        return RequisitionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get("item_id")
        status_value = self.request.query_params.get("status")
        requested_for = self.request.query_params.get("requested_for")
        active_only = self.request.query_params.get("active_only")
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if requested_for:
            queryset = queryset.filter(requested_for__icontains=requested_for)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class RequisitionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Requisition.objects.select_related("item", "requested_by")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return RequisitionWriteSerializer
        return RequisitionSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SupplierListAPIView(generics.ListAPIView):
    queryset = Supplier.objects.filter(is_active=True).order_by("name")
    serializer_class = SupplierSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
    }


class SupplierCreateAPIView(generics.CreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierWriteSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }


class SupplierDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return SupplierWriteSerializer
        return SupplierSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PurchaseOrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PurchaseOrderListCreateAPIView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.select_related("supplier").prefetch_related("lines__item").order_by(
        "-order_date",
        "-created_at",
    )
    serializer_class = PurchaseOrderSerializer
    pagination_class = PurchaseOrderPagination
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PURCHASE_ORDERS],
        "POST": [RolePermissionCodes.MANAGE_PURCHASE_ORDERS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        supplier_id = self.request.query_params.get("supplier_id")
        status_value = self.request.query_params.get("status")
        order_date_from = self.request.query_params.get("order_date_from")
        order_date_to = self.request.query_params.get("order_date_to")
        active_only = self.request.query_params.get("active_only")

        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if order_date_from:
            queryset = queryset.filter(order_date__gte=order_date_from)
        if order_date_to:
            queryset = queryset.filter(order_date__lte=order_date_to)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class PurchaseOrderDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.select_related("supplier").prefetch_related("lines__item")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_PURCHASE_ORDERS],
        "PUT": [RolePermissionCodes.MANAGE_PURCHASE_ORDERS],
        "PATCH": [RolePermissionCodes.MANAGE_PURCHASE_ORDERS],
        "DELETE": [RolePermissionCodes.MANAGE_PURCHASE_ORDERS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return PurchaseOrderWriteSerializer
        return PurchaseOrderSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockIssueListCreateAPIView(generics.ListCreateAPIView):
    queryset = StockIssue.objects.select_related("item", "requisition").order_by(
        "-issue_date",
        "-created_at",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StockIssueWriteSerializer
        return StockIssueSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get("item_id")
        issued_to_type = self.request.query_params.get("issued_to_type")
        active_only = self.request.query_params.get("active_only")
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        if issued_to_type:
            queryset = queryset.filter(issued_to_type=issued_to_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class StockIssueDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockIssue.objects.select_related("item", "requisition")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return StockIssueWriteSerializer
        return StockIssueSerializer

    def perform_destroy(self, instance):
        # Revert linked requisition quantity_issued
        if instance.requisition and instance.is_active:
            requisition = instance.requisition
            requisition.quantity_issued = max(
                0,
                requisition.quantity_issued - instance.quantity,
            )
            if requisition.quantity_issued <= 0:
                requisition.status = Requisition.RequisitionStatus.APPROVED
            elif requisition.quantity_issued < (requisition.quantity_approved or 0):
                requisition.status = Requisition.RequisitionStatus.PARTIALLY_ISSUED
            else:
                requisition.status = Requisition.RequisitionStatus.FULFILLED
            requisition.save(update_fields=["quantity_issued", "status", "updated_at"])

        # Revert linked PO line received quantity
        if instance.purchase_order_line and instance.is_active:
            po_line = instance.purchase_order_line
            po_line.received_quantity = max(
                0,
                po_line.received_quantity - instance.quantity,
            )
            po_line.save(update_fields=["received_quantity"])

        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdjustmentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Adjustment.objects.select_related("item").order_by(
        "-adjustment_date",
        "-created_at",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "POST": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdjustmentWriteSerializer
        return AdjustmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get("item_id")
        adjustment_type = self.request.query_params.get("adjustment_type")
        active_only = self.request.query_params.get("active_only")
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        if adjustment_type:
            queryset = queryset.filter(adjustment_type=adjustment_type)
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        return queryset


class AdjustmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Adjustment.objects.select_related("item")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
        "PUT": [RolePermissionCodes.MANAGE_STORES],
        "PATCH": [RolePermissionCodes.MANAGE_STORES],
        "DELETE": [RolePermissionCodes.MANAGE_STORES],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return AdjustmentWriteSerializer
        return AdjustmentSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StoresSummaryAPIView(generics.GenericAPIView):
    """
    API endpoint that returns summary metrics for the stores module.
    Computes metrics server-side to avoid client-side calculation errors.
    """
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_STORES],
    }

    def get(self, request, *args, **kwargs):
        # Fetch all required data
        items = Item.objects.with_stock_snapshot()
        receivings = StockReceiving.objects.filter(is_active=True)
        requisitions = Requisition.objects.filter(is_active=True)
        issues = StockIssue.objects.filter(is_active=True)
        adjustments = Adjustment.objects.filter(is_active=True)
        purchase_orders = PurchaseOrder.objects.filter(is_active=True)

        # Calculate metrics
        summary = {
            "activeItems": items.filter(is_active=True).count(),
            "belowReorder": items.filter(is_below_reorder_level=True).count(),
            "totalStockOnHand": items.aggregate(total=Sum("stock_on_hand"))["total"] or 0,
            "totalReceivings": receivings.aggregate(total=Sum("quantity"))["total"] or 0,
            "totalIssues": issues.aggregate(total=Sum("quantity"))["total"] or 0,
            "pendingRequisitions": requisitions.filter(
                status__in=[
                    Requisition.RequisitionStatus.DRAFT,
                    Requisition.RequisitionStatus.PENDING_APPROVAL,
                    Requisition.RequisitionStatus.APPROVED,
                    Requisition.RequisitionStatus.PARTIALLY_ISSUED,
                ]
            ).count(),
            "pendingAdjustments": adjustments.count(),
            "pendingPurchaseOrders": purchase_orders.filter(
                status__in=["draft", "open", "partial"]
            ).count(),
        }

        return Response(summary, status=status.HTTP_200_OK)
