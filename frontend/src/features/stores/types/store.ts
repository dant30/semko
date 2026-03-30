export type StoreView = "items" | "receivings" | "requisitions" | "issues" | "adjustments" | "purchase_orders" | "suppliers";

export type StoreItemCategory =
  | "spare_part"
  | "consumable"
  | "tyre"
  | "lubricant"
  | "tooling"
  | "other";

export type StoreUnitOfMeasure = "piece" | "litre" | "kilogram" | "set" | "box";

export type RequisitionStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "partially_issued"
  | "fulfilled"
  | "rejected"
  | "cancelled";

export type IssuedToType = "driver" | "vehicle" | "department" | "workshop" | "other";

export type AdjustmentType = "increase" | "decrease";

export interface StoreItemRecord {
  id: number;
  name: string;
  code: string;
  category: StoreItemCategory;
  unit_of_measure: StoreUnitOfMeasure;
  description: string;
  reorder_level: string;
  standard_issue_quantity: string | null;
  is_active: boolean;
  stock_on_hand: string;
  is_below_reorder_level: boolean;
  reorder_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockReceivingRecord {
  id: number;
  item: number;
  item_name: string;
  reference_no: string;
  received_date: string;
  quantity: string;
  unit_cost: string | null;
  supplier_name: string;
  notes: string;
  is_active: boolean;
}

export interface RequisitionRecord {
  id: number;
  item: number;
  item_name: string;
  reference_no: string;
  requested_by: number;
  requested_by_username: string;
  requested_for: string;
  quantity_requested: string;
  quantity_approved: string | null;
  quantity_issued: string;
  status: RequisitionStatus;
  needed_by: string | null;
  notes: string;
  is_active: boolean;
  available_stock: string;
}

export interface StockIssueRecord {
  id: number;
  item: number;
  item_name: string;
  requisition: number | null;
  requisition_reference: string;
  reference_no: string;
  issue_date: string;
  quantity: string;
  unit_cost: string | null;
  issued_to_type: IssuedToType;
  issued_to_name: string;
  purpose: string;
  notes: string;
  is_active: boolean;
}

export interface AdjustmentRecord {
  id: number;
  item: number;
  item_name: string;
  reference_no: string;
  adjustment_date: string;
  adjustment_type: AdjustmentType;
  quantity: string;
  reason: string;
  notes: string;
  is_active: boolean;
}

export interface StoresFilters {
  activeOnly: boolean;
  reorderOnly: boolean;
  search: string;
  view: StoreView;
}

export interface StoreSummaryMetrics {
  activeItems: number;
  belowReorder: number;
  totalStockOnHand: number;
  totalReceivings: number;
  totalIssues: number;
  pendingRequisitions: number;
  pendingAdjustments: number;
  pendingPurchaseOrders: number;
}

export interface PurchaseOrderLineRecord {
  id: number;
  item: number;
  item_name: string;
  ordered_quantity: string;
  received_quantity: string;
  unit_cost: string | null;
  is_active: boolean;
}

export interface PurchaseOrderRecord {
  id: number;
  supplier: number;
  supplier_name: string;
  reference_no: string;
  order_date: string;
  expected_date: string | null;
  status: string;
  notes: string;
  is_active: boolean;
  total_ordered: string;
  lines: PurchaseOrderLineRecord[];
}

export interface SupplierRecord {
  id: number;
  name: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

export interface StoreItemFormValues {
  category: StoreItemCategory;
  code: string;
  description: string;
  is_active: boolean;
  name: string;
  reorder_level: string;
  standard_issue_quantity: string;
  unit_of_measure: StoreUnitOfMeasure;
}

export interface StockReceivingFormValues {
  item_id: string;
  purchase_order_id: string;
  purchase_order_line_id: string;
  is_active: boolean;
  notes: string;
  quantity: string;
  received_date: string;
  reference_no: string;
  supplier_name: string;
  unit_cost: string;
}

export interface RequisitionFormValues {
  item_id: string;
  is_active: boolean;
  needed_by: string;
  notes: string;
  quantity_approved: string;
  quantity_requested: string;
  reference_no: string;
  requested_for: string;
  status: RequisitionStatus;
}

export interface StockIssueFormValues {
  is_active: boolean;
  issue_date: string;
  issued_to_name: string;
  issued_to_type: IssuedToType;
  item_id: string;
  notes: string;
  purpose: string;
  quantity: string;
  reference_no: string;
  requisition_id: string;
  unit_cost: string;
}

export interface PurchaseOrderLineFormValues {
  item_id: string;
  ordered_quantity: string;
  unit_cost: string;
}

export interface PurchaseOrderFormValues {
  supplier: number | string;
  reference_no: string;
  order_date: string;
  expected_date: string;
  status: string;
  notes: string;
  is_active: boolean;
  line_items: PurchaseOrderLineFormValues[];
}

export interface AdjustmentFormValues {
  adjustment_date: string;
  adjustment_type: AdjustmentType;
  is_active: boolean;
  item_id: string;
  notes: string;
  quantity: string;
  reason: string;
  reference_no: string;
}

