import { useCallback, useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  buildStoreSummaryMetrics,
  createInitialAdjustmentFormValues,
  createInitialIssueFormValues,
  createInitialPurchaseOrderFormValues,
  createInitialReceivingFormValues,
  createInitialRequisitionFormValues,
  createInitialStoreItemFormValues,
  createInitialSupplierFormValues,
  storesApi,
} from "@/features/stores/services/stores.api";
import { setStoresFilters, setStoresView } from "@/features/stores/store/stores.slice";
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
  SupplierRecord,
  StoreItemFormValues,
  StoreItemRecord,
  StoreSummaryMetrics,
  StoreView,
} from "@/features/stores/types/store";

const EMPTY_SUMMARY: StoreSummaryMetrics = {
  activeItems: 0,
  belowReorder: 0,
  pendingAdjustments: 0,
  pendingRequisitions: 0,
  totalIssues: 0,
  totalReceivings: 0,
  totalStockOnHand: 0,
  pendingPurchaseOrders: 0,
};

export function useStoresWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.stores);
  const { showToast } = useNotifications();

  const [items, setItems] = useState<StoreItemRecord[]>([]);
  const [receivings, setReceivings] = useState<StockReceivingRecord[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionRecord[]>([]);
  const [issues, setIssues] = useState<StockIssueRecord[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [supplierForm, setSupplierForm] = useState<Omit<SupplierRecord, "id">>(
    createInitialSupplierFormValues
  );
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [purchaseOrderFilters, setPurchaseOrderFilters] = useState({
    supplierId: "",
    status: "",
    orderDateFrom: "",
    orderDateTo: "",
    page: 1,
    pageSize: 10,
    activeOnly: true,
  });
  const [summary, setSummary] = useState<StoreSummaryMetrics>(EMPTY_SUMMARY);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submittingView, setSubmittingView] = useState<StoreView | null>(null);

  const [itemForm, setItemForm] = useState<StoreItemFormValues>(createInitialStoreItemFormValues);
  const [receivingForm, setReceivingForm] = useState<StockReceivingFormValues>(
    createInitialReceivingFormValues
  );
  const [requisitionForm, setRequisitionForm] = useState<RequisitionFormValues>(
    createInitialRequisitionFormValues
  );
  const [issueForm, setIssueForm] = useState<StockIssueFormValues>(createInitialIssueFormValues);
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentFormValues>(
    createInitialAdjustmentFormValues
  );
  const [purchaseOrderForm, setPurchaseOrderForm] = useState<PurchaseOrderFormValues>(
    createInitialPurchaseOrderFormValues
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      storesApi.fetchItems(filters),
      storesApi.fetchReceivings(),
      storesApi.fetchRequisitions(),
      storesApi.fetchIssues(),
      storesApi.fetchAdjustments(),
      storesApi.fetchSuppliers(),
      storesApi.fetchPurchaseOrders({
        supplierId: purchaseOrderFilters.supplierId,
        status: purchaseOrderFilters.status,
        orderDateFrom: purchaseOrderFilters.orderDateFrom,
        orderDateTo: purchaseOrderFilters.orderDateTo,
        page: purchaseOrderFilters.page,
        pageSize: purchaseOrderFilters.pageSize,
        activeOnly: purchaseOrderFilters.activeOnly,
      }),
      storesApi.fetchSummary(),
    ])
      .then(([
        itemsData,
        receivingsData,
        requisitionsData,
        issuesData,
        adjustmentsData,
        suppliersData,
        purchaseOrdersData,
        summaryData,
      ]) => {
        if (!active) {
          return;
        }

        setItems(itemsData);
        setReceivings(receivingsData);
        setRequisitions(requisitionsData);
        setIssues(issuesData);
        setAdjustments(adjustmentsData);
        setPurchaseOrders(purchaseOrdersData);
        setSuppliers(suppliersData);
        setSummary(summaryData);
      })
      .catch(() => {
        if (active) {
          setError("We could not load the stores workspace right now.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters, purchaseOrderFilters]);

  const itemOptions = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: item.name,
        subtitle: `${item.code} - ${item.stock_on_hand} ${item.unit_of_measure}`,
      })),
    [items]
  );

  const parseFieldErrors = useCallback((payload: unknown) => {
    if (!payload || typeof payload !== "object") {
      return {} as Record<string, string>;
    }

    if (Array.isArray(payload)) {
      return {} as Record<string, string>;
    }

    return Object.entries(payload).reduce((errors, [key, value]) => {
      if (typeof value === "string") {
        errors[key] = value;
      } else if (Array.isArray(value)) {
        errors[key] = value.filter((item) => typeof item === "string").join(" ");
      } else if (value !== null && typeof value === "object") {
        errors[key] = JSON.stringify(value);
      }
      return errors;
    }, {} as Record<string, string>);
  }, []);

  const setFiltersCallback = useCallback(
    (payload: Partial<typeof filters>) => dispatch(setStoresFilters(payload)),
    [dispatch]
  );

  async function refreshAll() {
    setIsLoading(true);
    try {
      const [
        itemsData,
        receivingsData,
        requisitionsData,
        issuesData,
        adjustmentsData,
        suppliersData,
        purchaseOrdersData,
        summaryData,
      ] = await Promise.all([
        storesApi.fetchItems(filters),
        storesApi.fetchReceivings(),
        storesApi.fetchRequisitions(),
        storesApi.fetchIssues(),
        storesApi.fetchAdjustments(),
        storesApi.fetchSuppliers(),
        storesApi.fetchPurchaseOrders({
          supplierId: purchaseOrderFilters.supplierId,
          status: purchaseOrderFilters.status,
          orderDateFrom: purchaseOrderFilters.orderDateFrom,
          orderDateTo: purchaseOrderFilters.orderDateTo,
          page: purchaseOrderFilters.page,
          pageSize: purchaseOrderFilters.pageSize,
          activeOnly: purchaseOrderFilters.activeOnly,
        }),
        storesApi.fetchSummary(),
      ]);

      setItems(itemsData);
      setReceivings(receivingsData);
      setRequisitions(requisitionsData);
      setIssues(issuesData);
      setAdjustments(adjustmentsData);
      setSuppliers(suppliersData);
      setPurchaseOrders(purchaseOrdersData);
      setSummary(summaryData);
    } catch {
      setError("We could not refresh the stores workspace right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitForView(view: StoreView) {
    setSubmittingView(view);
    setError("");
    setFieldErrors({});

    try {
      switch (view) {
        case "items":
          if (editingItemId !== null) {
            await storesApi.updateItem(editingItemId, itemForm);
            setEditingItemId(null);
          } else {
            await storesApi.createItem(itemForm);
          }
          setItemForm(createInitialStoreItemFormValues());
          break;
        case "receivings":
          await storesApi.createReceiving(receivingForm);
          setReceivingForm(createInitialReceivingFormValues());
          break;
        case "requisitions":
          await storesApi.createRequisition(requisitionForm);
          setRequisitionForm(createInitialRequisitionFormValues());
          break;
        case "issues":
          await storesApi.createIssue(issueForm);
          setIssueForm(createInitialIssueFormValues());
          break;
        case "adjustments":
          await storesApi.createAdjustment(adjustmentForm);
          setAdjustmentForm(createInitialAdjustmentFormValues());
          break;
        case "purchase_orders":
          await storesApi.createPurchaseOrder(purchaseOrderForm);
          setPurchaseOrderForm(createInitialPurchaseOrderFormValues());
          break;
        case "suppliers":
          if (editingSupplierId !== null) {
            await storesApi.updateSupplier(editingSupplierId, supplierForm);
            setEditingSupplierId(null);
          } else {
            await storesApi.createSupplier(supplierForm);
          }
          setSupplierForm(createInitialSupplierFormValues());
          break;
      }

      await refreshAll();
      showToast({
        message: `${view.charAt(0).toUpperCase()}${view.slice(1)} workflow updated successfully.`,
        title: "Stores updated",
        tone: "success",
      });
    } catch (error) {
      const message = "We could not save the stores transaction. Please review the form and try again.";
      setError(message);
      showToast({
        message,
        title: "Stores save failed",
        tone: "danger",
      });

      const payload = (error as any)?.response?.data;
      if (payload) {
        setFieldErrors(parseFieldErrors(payload));
      }
    } finally {
      setSubmittingView(null);
    }
  }

  function startEditItem(item: StoreItemRecord) {
    setEditingItemId(item.id);
    setItemForm({
      category: item.category,
      code: item.code,
      description: item.description,
      is_active: item.is_active,
      name: item.name,
      reorder_level: item.reorder_level ?? "0.00",
      standard_issue_quantity: item.standard_issue_quantity ?? "",
      unit_of_measure: item.unit_of_measure,
    });
  }

  function cancelEditItem() {
    setEditingItemId(null);
    setItemForm(createInitialStoreItemFormValues());
  }

  function startEditSupplier(supplier: SupplierRecord) {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      contact_name: supplier.contact_name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      is_active: supplier.is_active,
    });
  }

  function cancelEditSupplier() {
    setEditingSupplierId(null);
    setSupplierForm(createInitialSupplierFormValues());
  }

  async function deleteSupplier(id: number) {
    setIsLoading(true);
    try {
      await storesApi.deleteSupplier(id);
      await refreshAll();
      showToast({
        title: "Supplier deleted",
        message: "Supplier has been removed.",
        tone: "success",
      });
    } catch {
      setError("Could not delete supplier.");
      showToast({
        title: "Delete failed",
        message: "Could not delete supplier.",
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteItem(id: number) {
    setIsLoading(true);
    try {
      await storesApi.deleteItem(id);
      await refreshAll();
      showToast({
        title: "Item deleted",
        message: "Store item has been removed.",
        tone: "success",
      });
    } catch {
      setError("Could not delete store item.");
      showToast({
        title: "Delete failed",
        message: "Could not delete store item.",
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    adjustmentForm,
    adjustments,
    error,
    filters,
    isLoading,
    itemForm,
    itemOptions,
    items,
    issueForm,
    issues,
    receivingForm,
    receivings,
    purchaseOrderForm,
    purchaseOrders,
    refreshAll,
    requisitionForm,
    requisitions,
    setAdjustmentForm,
    setFilters: (payload: Partial<typeof filters>) => dispatch(setStoresFilters(payload)),
    setIssueForm,
    setItemForm,
    setPurchaseOrderForm,
    setReceivingForm,
    setRequisitionForm,
    setSupplierForm,
    setView: (view: StoreView) => dispatch(setStoresView(view)),
    suppliers,
    supplierForm,
    purchaseOrderFilters,
    setPurchaseOrderFilters,
    editingItemId,
    editingSupplierId,
    startEditItem,
    cancelEditItem,
    startEditSupplier,
    cancelEditSupplier,
    deleteItem,
    deleteSupplier,
    submittingView,
    submitForView,
    summary,
  };
}
