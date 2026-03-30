import { apiClient } from "@/core/api/client";
import type {
  AdjustmentFormValues,
  AdjustmentRecord,
  RequisitionFormValues,
  RequisitionRecord,
  StockIssueFormValues,
  StockIssueRecord,
  StockReceivingFormValues,
  StockReceivingRecord,
  PurchaseOrderFormValues,
  PurchaseOrderRecord,
  PurchaseOrderLineRecord,
  StoreItemFormValues,
  SupplierRecord,
  StoreItemRecord,
  StoresFilters,
  StoreSummaryMetrics,
} from "@/features/stores/types/store";

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: T[] }).results;
  }

  return [];
}

export const storesApi = {
  async fetchItems(filters: Pick<StoresFilters, "activeOnly" | "reorderOnly" | "search">) {
    const response = await apiClient.get("/stores/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        reorder_only: filters.reorderOnly ? "true" : undefined,
        search: filters.search || undefined,
      },
    });

    return normalizeArrayResponse<StoreItemRecord>(response.data);
  },

  async createItem(values: StoreItemFormValues) {
    const response = await apiClient.post<StoreItemRecord>("/stores/", {
      ...values,
      reorder_level: values.reorder_level || "0.00",
      standard_issue_quantity: values.standard_issue_quantity || null,
    });
    return response.data;
  },

  async updateItem(id: number, values: StoreItemFormValues) {
    const response = await apiClient.put<StoreItemRecord>(`/stores/${id}/`, {
      ...values,
      reorder_level: values.reorder_level || "0.00",
      standard_issue_quantity: values.standard_issue_quantity || null,
    });
    return response.data;
  },

  async deleteItem(id: number) {
    const response = await apiClient.delete(`/stores/${id}/`);
    return response.data;
  },

  async fetchReceivings() {
    const response = await apiClient.get("/stores/receivings/", {
      params: { active_only: "true" },
    });
    return normalizeArrayResponse<StockReceivingRecord>(response.data);
  },

  async createReceiving(values: StockReceivingFormValues) {
    const response = await apiClient.post<StockReceivingRecord>("/stores/receivings/", {
      ...values,
      item_id: Number(values.item_id),
      purchase_order_id: values.purchase_order_id ? Number(values.purchase_order_id) : null,
      purchase_order_line_id: values.purchase_order_line_id ? Number(values.purchase_order_line_id) : null,
      quantity: values.quantity || "0.00",
      unit_cost: values.unit_cost || null,
    });
    return response.data;
  },

  async fetchRequisitions() {
    const response = await apiClient.get("/stores/requisitions/", {
      params: { active_only: "true" },
    });
    return normalizeArrayResponse<RequisitionRecord>(response.data);
  },

  async createRequisition(values: RequisitionFormValues) {
    const response = await apiClient.post<RequisitionRecord>("/stores/requisitions/", {
      ...values,
      item_id: Number(values.item_id),
      quantity_requested: values.quantity_requested || "0.00",
      quantity_approved: values.quantity_approved || null,
      needed_by: values.needed_by || null,
    });
    return response.data;
  },

  async fetchIssues() {
    const response = await apiClient.get("/stores/issues/", {
      params: { active_only: "true" },
    });
    return normalizeArrayResponse<StockIssueRecord>(response.data);
  },

  async createIssue(values: StockIssueFormValues) {
    const response = await apiClient.post<StockIssueRecord>("/stores/issues/", {
      ...values,
      item_id: Number(values.item_id),
      quantity: values.quantity || "0.00",
      requisition_id: values.requisition_id ? Number(values.requisition_id) : null,
      unit_cost: values.unit_cost || null,
    });
    return response.data;
  },

  async fetchAdjustments() {
    const response = await apiClient.get("/stores/adjustments/", {
      params: { active_only: "true" },
    });
    return normalizeArrayResponse<AdjustmentRecord>(response.data);
  },

  async createAdjustment(values: AdjustmentFormValues) {
    const response = await apiClient.post<AdjustmentRecord>("/stores/adjustments/", {
      ...values,
      item_id: Number(values.item_id),
      quantity: values.quantity || "0.00",
    });
    return response.data;
  },

  async fetchSuppliers() {
    const response = await apiClient.get("/stores/suppliers/");
    return normalizeArrayResponse<SupplierRecord>(response.data);
  },

  async createSupplier(values: Omit<SupplierRecord, "id" | "created_at" | "updated_at">) {
    const response = await apiClient.post<SupplierRecord>("/stores/suppliers/create/", values);
    return response.data;
  },

  async updateSupplier(
    id: number,
    values: Partial<Omit<SupplierRecord, "id" | "created_at" | "updated_at">>
  ) {
    const response = await apiClient.patch<SupplierRecord>(`/stores/suppliers/${id}/`, values);
    return response.data;
  },

  async deleteSupplier(id: number) {
    const response = await apiClient.delete(`/stores/suppliers/${id}/`);
    return response.data;
  },

  async fetchSummary(): Promise<StoreSummaryMetrics> {
    const response = await apiClient.get<StoreSummaryMetrics>("/stores/summary/");
    return response.data;
  },

  async fetchPurchaseOrders(filters?: {
    supplierId?: number | string;
    status?: string;
    orderDateFrom?: string;
    orderDateTo?: string;
    page?: number;
    pageSize?: number;
    activeOnly?: boolean;
  }) {
    const response = await apiClient.get("/stores/purchase-orders/", {
      params: {
        supplier_id: filters?.supplierId || undefined,
        status: filters?.status || undefined,
        order_date_from: filters?.orderDateFrom || undefined,
        order_date_to: filters?.orderDateTo || undefined,
        page: filters?.page || undefined,
        page_size: filters?.pageSize || undefined,
        active_only: filters?.activeOnly ? "true" : undefined,
      },
    });
    return normalizeArrayResponse<PurchaseOrderRecord>(response.data);
  },

  async createPurchaseOrder(values: PurchaseOrderFormValues) {
    const response = await apiClient.post<PurchaseOrderRecord>("/stores/purchase-orders/", {
      ...values,
      supplier: Number(values.supplier),
      line_items: values.line_items.map((line) => ({
        ...line,
        item_id: Number(line.item_id),
        ordered_quantity: line.ordered_quantity || "0.00",
        unit_cost: line.unit_cost || null,
      })),
    });
    return response.data;
  },
};

export function createInitialStoreItemFormValues(): StoreItemFormValues {
  return {
    category: "spare_part",
    code: "",
    description: "",
    is_active: true,
    name: "",
    reorder_level: "0.00",
    standard_issue_quantity: "",
    unit_of_measure: "piece",
  };
}

export function createInitialReceivingFormValues(): StockReceivingFormValues {
  return {
    item_id: "",
    purchase_order_id: "",
    purchase_order_line_id: "",
    is_active: true,
    notes: "",
    quantity: "",
    received_date: new Date().toISOString().slice(0, 10),
    reference_no: "",
    supplier_name: "",
    unit_cost: "",
  };
}

export function createInitialRequisitionFormValues(): RequisitionFormValues {
  return {
    item_id: "",
    is_active: true,
    needed_by: "",
    notes: "",
    quantity_approved: "",
    quantity_requested: "",
    reference_no: "",
    requested_for: "",
    status: "pending_approval",
  };
}

export function createInitialIssueFormValues(): StockIssueFormValues {
  return {
    is_active: true,
    issue_date: new Date().toISOString().slice(0, 10),
    issued_to_name: "",
    issued_to_type: "department",
    item_id: "",
    notes: "",
    purpose: "",
    quantity: "",
    reference_no: "",
    requisition_id: "",
    unit_cost: "",
  };
}

export function createInitialAdjustmentFormValues(): AdjustmentFormValues {
  return {
    adjustment_date: new Date().toISOString().slice(0, 10),
    adjustment_type: "increase",
    is_active: true,
    item_id: "",
    notes: "",
    quantity: "",
    reason: "",
    reference_no: "",
  };
}

export function createInitialPurchaseOrderFormValues(): PurchaseOrderFormValues {
  return {
    supplier: "",
    reference_no: "",
    order_date: new Date().toISOString().slice(0, 10),
    expected_date: "",
    status: "draft",
    notes: "",
    is_active: true,
    line_items: [
      {
        item_id: "",
        ordered_quantity: "0.00",
        unit_cost: "",
      },
    ],
  };
}

export function createInitialSupplierFormValues(): Omit<SupplierRecord, "id"> {
  return {
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  };
}

export function buildStoreSummaryMetrics(input: {
  adjustments: AdjustmentRecord[];
  items: StoreItemRecord[];
  issues: StockIssueRecord[];
  receivings: StockReceivingRecord[];
  requisitions: RequisitionRecord[];
  purchaseOrders: PurchaseOrderRecord[];
}): StoreSummaryMetrics {
  return {
    activeItems: input.items.filter((item) => item.is_active).length,
    belowReorder: input.items.filter((item) => item.is_below_reorder_level).length,
    pendingAdjustments: input.adjustments.filter((item) => item.is_active).length,
    pendingRequisitions: input.requisitions.filter((item) =>
      ["draft", "pending_approval", "approved", "partially_issued"].includes(item.status)
    ).length,
    totalIssues: input.issues.reduce((sum, issue) => sum + Number(issue.quantity || 0), 0),
    totalReceivings: input.receivings.reduce(
      (sum, receiving) => sum + Number(receiving.quantity || 0),
      0
    ),
    totalStockOnHand: input.items.reduce(
      (sum, item) => sum + Number(item.stock_on_hand || 0),
      0
    ),
    pendingPurchaseOrders: input.purchaseOrders.filter((po) => po.status !== "closed" && po.is_active).length,
  };
}
