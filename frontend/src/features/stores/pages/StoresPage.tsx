import { Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useAppSelector } from "@/core/store/hooks";
import {
  AdjustmentFormCard,
  IssueFormCard,
  PurchaseOrderFormCard,
  ReceivingFormCard,
  RequisitionFormCard,
  StoreItemFormCard,
  StoreItemsTable,
  StoreTransactionsTable,
  StoresSummaryCards,
  SupplierFormCard,
  SuppliersTable,
} from "@/features/stores/components";
import { useStoresWorkspace } from "@/features/stores/hooks/useStoresWorkspace";
import type {
  AdjustmentRecord,
  PurchaseOrderRecord,
  RequisitionRecord,
  StockIssueRecord,
  StockReceivingRecord,
  StoreView,
} from "@/features/stores/types/store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { formatNumber } from "@/shared/utils/number";

function getViewFromPath(pathname: string): StoreView {
  if (pathname === appRoutes.storesReceivings) return "receivings";
  if (pathname === appRoutes.storesRequisitions) return "requisitions";
  if (pathname === appRoutes.storesIssues) return "issues";
  if (pathname === appRoutes.storesAdjustments) return "adjustments";
  if (pathname === appRoutes.storesPurchaseOrders) return "purchase_orders";
  if (pathname === appRoutes.storesSuppliers) return "suppliers";
  return "items";
}

function getStoreViewLabel(view: StoreView): string {
  switch (view) {
    case "items":
      return "Items";
    case "receivings":
      return "Receivings";
    case "requisitions":
      return "Requisitions";
    case "issues":
      return "Stock issues";
    case "adjustments":
      return "Adjustments";
    case "purchase_orders":
      return "Purchase orders";
    case "suppliers":
      return "Suppliers";
  }
}

export function StoresPage() {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageStores = hasAnyPermission(
    getUserPermissions(user),
    [permissions.manageStores]
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<number | null>(null);
  const {
    adjustmentForm,
    adjustments,
    cancelEditItem,
    deleteItem,
    editingItemId,
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
    suppliers,
    supplierForm,
    setSupplierForm,
    fieldErrors,
    editingSupplierId,
    startEditSupplier,
    cancelEditSupplier,
    deleteSupplier,
    purchaseOrderFilters,
    setPurchaseOrderFilters,
    refreshAll,
    requisitionForm,
    requisitions,
    setAdjustmentForm,
    setFilters,
    setIssueForm,
    setItemForm,
    setPurchaseOrderForm,
    setReceivingForm,
    setRequisitionForm,
    setView,
    startEditItem,
    submittingView,
    submitForView,
    summary,
  } = useStoresWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  const requisitionOptions = requisitions
    .filter((item) => ["approved", "partially_issued"].includes(item.status))
    .map((item) => ({
      id: item.id,
      label: `${item.reference_no} - ${item.item_name}`,
    }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Stores operational stats</div>
        <StoresSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search item name, code, or description"
              value={filters.search}
            />
          </label>
          <label className="inline-flex items-center gap-3 rounded-full border border-surface-border bg-white/70 px-4 py-2 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={filters.activeOnly}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => setFilters({ activeOnly: event.target.checked })}
              type="checkbox"
            />
            Active only
          </label>
          <label className="inline-flex items-center gap-3 rounded-full border border-surface-border bg-white/70 px-4 py-2 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={filters.reorderOnly}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => setFilters({ reorderOnly: event.target.checked })}
              type="checkbox"
            />
            Reorder only
          </label>
        </div>
        <Button onClick={refreshAll} type="button" variant="ghost">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </section>

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl capitalize">{getStoreViewLabel(activeView)}</h3>
            <p className="mt-1 text-sm text-app-secondary">
              {activeView === "items" && "Manage inventory items, stock levels, and transaction records."}
              {activeView === "receivings" && "Review inbound stock records and supplier deliveries."}
              {activeView === "requisitions" && "Review internal demand requests and approvals."}
              {activeView === "issues" && "Review stock issue records to teams, vehicles, and workshops."}
              {activeView === "adjustments" && "Review inventory adjustments and stock correction history."}
            </p>
          </div>
          {canManageStores ? (
            <Button
              onClick={() => setShowCreateForm((prev) => !prev)}
              type="button"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              {activeView === "items" && "Create item"}
              {activeView === "receivings" && "Record receiving"}
              {activeView === "requisitions" && "Create requisition"}
              {activeView === "issues" && "Record stock issue"}
              {activeView === "purchase_orders" && "Create purchase order"}
              {activeView === "suppliers" && "Add supplier"}
              {activeView === "adjustments" && "Record adjustment"}
            </Button>
          ) : null}
        </div>

        {canManageStores && activeView === "items" && showCreateForm ? (
          <StoreItemFormCard
            editing={Boolean(editingItemId)}
            form={itemForm}
            onCancel={() => {
              setShowCreateForm(false);
              cancelEditItem();
            }}
            onSubmit={() => {
              submitForView("items");
              setShowCreateForm(false);
            }}
            setForm={setItemForm}
            submitting={submittingView === "items"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "receivings" && showCreateForm ? (
          <ReceivingFormCard
            form={receivingForm}
            itemOptions={itemOptions}
            purchaseOrders={purchaseOrders}
            onSubmit={() => {
              submitForView("receivings");
              setShowCreateForm(false);
            }}
            setForm={setReceivingForm}
            submitting={submittingView === "receivings"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "requisitions" && showCreateForm ? (
          <RequisitionFormCard
            form={requisitionForm}
            itemOptions={itemOptions}
            onSubmit={() => {
              submitForView("requisitions");
              setShowCreateForm(false);
            }}
            setForm={setRequisitionForm}
            submitting={submittingView === "requisitions"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "issues" && showCreateForm ? (
          <IssueFormCard
            form={issueForm}
            itemOptions={itemOptions}
            onSubmit={() => {
              submitForView("issues");
              setShowCreateForm(false);
            }}
            requisitionOptions={requisitionOptions}
            setForm={setIssueForm}
            submitting={submittingView === "issues"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "purchase_orders" && showCreateForm ? (
          <PurchaseOrderFormCard
            form={purchaseOrderForm}
            onSubmit={() => {
              submitForView("purchase_orders");
              setShowCreateForm(false);
            }}
            setForm={setPurchaseOrderForm}
            suppliers={suppliers.map((s) => ({ id: s.id, label: s.name }))}
            itemOptions={itemOptions}
            submitting={submittingView === "purchase_orders"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "suppliers" && showCreateForm ? (
          <SupplierFormCard
            form={supplierForm}
            onSubmit={() => {
              submitForView("suppliers");
              setShowCreateForm(false);
            }}
            setForm={setSupplierForm}
            editing={Boolean(editingSupplierId)}
            onCancel={() => {
              setShowCreateForm(false);
              cancelEditSupplier();
            }}
            submitting={submittingView === "suppliers"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {canManageStores && activeView === "adjustments" && showCreateForm ? (
          <AdjustmentFormCard
            form={adjustmentForm}
            itemOptions={itemOptions}
            onSubmit={() => {
              submitForView("adjustments");
              setShowCreateForm(false);
            }}
            setForm={setAdjustmentForm}
            submitting={submittingView === "adjustments"}
            fieldErrors={fieldErrors}
          />
        ) : null}

        {activeView === "items" ? (
          <StoreItemsTable
            isLoading={isLoading}
            items={items}
            onEdit={(item) => {
              startEditItem(item);
              setShowCreateForm(true);
            }}
            onDelete={(item) => {
              deleteItem(item.id);
            }}
          />
        ) : null}
        {activeView === "receivings" ? (
          <StoreTransactionsTable<StockReceivingRecord>
            columns={[
              { key: "ref", label: "Reference", render: (row) => row.reference_no },
              { key: "item", label: "Item", render: (row) => row.item_name },
              { key: "supplier", label: "Supplier", render: (row) => row.supplier_name || "N/A" },
              { key: "date", label: "Date", render: (row) => row.received_date },
              { key: "qty", label: "Quantity", render: (row) => row.quantity },
            ]}
            emptyDescription="Record your first receiving to see inbound stock history."
            emptyTitle="No receivings available"
            isLoading={isLoading}
            rows={receivings}
          />
        ) : null}
        {activeView === "requisitions" ? (
          <StoreTransactionsTable<RequisitionRecord>
            columns={[
              { key: "ref", label: "Reference", render: (row) => row.reference_no },
              { key: "item", label: "Item", render: (row) => row.item_name },
              { key: "requested_for", label: "Requested for", render: (row) => row.requested_for },
              { key: "status", label: "Status", render: (row) => row.status.replace(/_/g, " ") },
              { key: "balance", label: "Available stock", render: (row) => row.available_stock },
            ]}
            emptyDescription="Create a requisition to manage internal stock demand and approvals."
            emptyTitle="No requisitions available"
            isLoading={isLoading}
            rows={requisitions}
          />
        ) : null}
        {activeView === "issues" ? (
          <StoreTransactionsTable<StockIssueRecord>
            columns={[
              { key: "ref", label: "Reference", render: (row) => row.reference_no },
              { key: "item", label: "Item", render: (row) => row.item_name },
              { key: "issued_to", label: "Issued to", render: (row) => `${row.issued_to_type}: ${row.issued_to_name}` },
              { key: "qty", label: "Quantity", render: (row) => row.quantity },
              { key: "req", label: "Requisition", render: (row) => row.requisition_reference || "Direct issue" },
            ]}
            emptyDescription="Record issued stock to teams, vehicles, workshops, or requisitions."
            emptyTitle="No stock issues available"
            isLoading={isLoading}
            rows={issues}
          />
        ) : null}
        {activeView === "purchase_orders" ? (
          <>
            <div className="grid gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65 md:grid-cols-2 lg:grid-cols-4">
              <label className="form-group">
                <span className="form-label">Supplier</span>
                <select
                  className="form-select"
                  value={purchaseOrderFilters.supplierId}
                  onChange={(event) => {
                    setSelectedPurchaseOrderId(null);
                    setPurchaseOrderFilters((current) => ({
                      ...current,
                      supplierId: event.target.value,
                      page: 1,
                    }));
                  }}
                >
                  <option value="">All suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-group">
                <span className="form-label">Status</span>
                <select
                  className="form-select"
                  value={purchaseOrderFilters.status}
                  onChange={(event) => {
                    setSelectedPurchaseOrderId(null);
                    setPurchaseOrderFilters((current) => ({
                      ...current,
                      status: event.target.value,
                      page: 1,
                    }));
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending approval</option>
                  <option value="approved">Approved</option>
                  <option value="partially_received">Partially received</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="form-group">
                <span className="form-label">Order from</span>
                <input
                  type="date"
                  className="form-input"
                  value={purchaseOrderFilters.orderDateFrom}
                  onChange={(event) => {
                    setSelectedPurchaseOrderId(null);
                    setPurchaseOrderFilters((current) => ({
                      ...current,
                      orderDateFrom: event.target.value,
                      page: 1,
                    }));
                  }}
                />
              </label>
              <label className="form-group">
                <span className="form-label">Order to</span>
                <input
                  type="date"
                  className="form-input"
                  value={purchaseOrderFilters.orderDateTo}
                  onChange={(event) => {
                    setSelectedPurchaseOrderId(null);
                    setPurchaseOrderFilters((current) => ({
                      ...current,
                      orderDateTo: event.target.value,
                      page: 1,
                    }));
                  }}
                />
              </label>
            </div>

            <StoreTransactionsTable<PurchaseOrderRecord>
              columns={[
                { key: "ref", label: "Reference", render: (row) => row.reference_no },
                { key: "supplier", label: "Supplier", render: (row) => row.supplier_name },
                { key: "status", label: "Status", render: (row) => row.status.replace(/_/g, " ") },
                { key: "total", label: "Total", render: (row) => row.total_ordered },
                {
                  key: "lines",
                  label: "Lines",
                  render: (row) => `${row.lines.length} item${row.lines.length === 1 ? "" : "s"}`,
                },
              ]}
              emptyDescription="Create a purchase order to track inbound procurement."
              emptyTitle="No purchase orders available"
              isLoading={isLoading}
              rows={purchaseOrders}
              onRowClick={(row) => setSelectedPurchaseOrderId(row.id)}
              selectedRowId={selectedPurchaseOrderId}
            />

            {selectedPurchaseOrderId !== null && (
              <Card className="rounded-[2rem] p-6">
                <h3 className="mb-3 text-lg font-semibold">Purchase order detail</h3>
                {purchaseOrders
                  .filter((po) => po.id === selectedPurchaseOrderId)
                  .map((selected) => (
                    <div key={selected.id}>
                      <p className="text-sm text-app-muted">
                        Reference: {selected.reference_no} • Supplier: {selected.supplier_name}
                      </p>
                      <table className="mt-4 min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Item</th>
                            <th className="px-3 py-2 text-right font-semibold">Ordered</th>
                            <th className="px-3 py-2 text-right font-semibold">Received</th>
                            <th className="px-3 py-2 text-right font-semibold">Remaining</th>
                            <th className="px-3 py-2 text-right font-semibold">Unit cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.lines.map((line) => {
                            const ordered = Number(line.ordered_quantity || 0);
                            const received = Number(line.received_quantity || 0);
                            const remaining = Math.max(0, ordered - received);
                            return (
                              <tr key={line.id}>
                                <td className="px-3 py-2">{line.item_name || line.item}</td>
                                <td className="px-3 py-2 text-right">{formatNumber(ordered)}</td>
                                <td className="px-3 py-2 text-right">{formatNumber(received)}</td>
                                <td className="px-3 py-2 text-right">{formatNumber(remaining)}</td>
                                <td className="px-3 py-2 text-right">{formatNumber(Number(line.unit_cost || 0))}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </Card>
            )}

            <div className="mt-3 flex items-center justify-between">
              <Button
                type="button"
                onClick={() =>
                  setPurchaseOrderFilters((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
                }
                disabled={purchaseOrderFilters.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-app-muted">Page {purchaseOrderFilters.page}</span>
              <Button
                type="button"
                onClick={() => setPurchaseOrderFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}

        {activeView === "suppliers" ? (
          <SuppliersTable
            isLoading={isLoading}
            suppliers={suppliers}
            onEdit={(supplier) => {
              startEditSupplier(supplier);
              setShowCreateForm(true);
            }}
            onDelete={(supplier) => {
              deleteSupplier(supplier.id);
            }}
          />
        ) : null}

        {activeView === "adjustments" ? (
          <StoreTransactionsTable<AdjustmentRecord>
            columns={[
              { key: "ref", label: "Reference", render: (row) => row.reference_no },
              { key: "item", label: "Item", render: (row) => row.item_name },
              { key: "type", label: "Type", render: (row) => row.adjustment_type },
              { key: "qty", label: "Quantity", render: (row) => row.quantity },
              { key: "reason", label: "Reason", render: (row) => row.reason },
            ]}
            emptyDescription="Record inventory corrections and stock count realignments."
            emptyTitle="No adjustments available"
            isLoading={isLoading}
            rows={adjustments}
          />
        ) : null}
      </section>
    </div>
  );
}