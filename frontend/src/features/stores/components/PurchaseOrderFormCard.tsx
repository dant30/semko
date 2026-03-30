import { Dispatch, SetStateAction } from "react";

import type {
  PurchaseOrderFormValues,
  PurchaseOrderLineFormValues,
} from "@/features/stores/types/store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function PurchaseOrderFormCard({
  form,
  onSubmit,
  setForm,
  suppliers,
  itemOptions,
  submitting,
  fieldErrors,
}: {
  form: PurchaseOrderFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<PurchaseOrderFormValues>>;
  suppliers: { id: number; label: string }[];
  itemOptions: { id: number; label: string; subtitle?: string }[];
  submitting: boolean;
  fieldErrors?: Record<string, string>;
}) {
  const supplierOptions = suppliers;

  const addLine = () => {
    setForm((current) => ({
      ...current,
      line_items: [
        ...current.line_items,
        { item_id: "", ordered_quantity: "0.00", unit_cost: "" },
      ],
    }));
  };

  const updateLine = (index: number, value: Partial<PurchaseOrderLineFormValues>) => {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.map((line, i) =>
        i !== index ? line : { ...line, ...value }
      ),
    }));
  };

  const removeLine = (index: number) => {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Local Purchase Order</h3>
        <p className="mt-2 text-sm">
          Create and manage incoming purchase orders before stock receiving.
        </p>
      </div>
      {fieldErrors && Object.keys(fieldErrors).length ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
          {Object.entries(fieldErrors).map(([field, message]) => (
            <p key={field} className="mb-1">
              <strong>{field.replace(/_/g, " ")}:</strong> {message}
            </p>
          ))}
        </div>
      ) : null}
      {fieldErrors && Object.keys(fieldErrors).length ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
          {Object.entries(fieldErrors).map(([key, value]) => (
            <p key={key} className="mb-1">
              <strong>{key.replace(/_/g, " ")}:</strong> {value}
            </p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-group">
          <span className="form-label">Supplier</span>
          <select
            className="form-select"
            value={form.supplier}
            onChange={(event) => setForm((current) => ({ ...current, supplier: event.target.value }))}
          >
            <option value="">Select supplier</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-group">
          <span className="form-label">PO Reference</span>
          <input
            className="form-input"
            value={form.reference_no}
            onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))}
          />
        </label>
        <label className="form-group">
          <span className="form-label">Order date</span>
          <input
            type="date"
            className="form-input"
            value={form.order_date}
            onChange={(event) => setForm((current) => ({ ...current, order_date: event.target.value }))}
          />
        </label>
        <label className="form-group">
          <span className="form-label">Expected date</span>
          <input
            type="date"
            className="form-input"
            value={form.expected_date}
            onChange={(event) => setForm((current) => ({ ...current, expected_date: event.target.value }))}
          />
        </label>
        <label className="form-group">
          <span className="form-label">Status</span>
          <select
            className="form-select"
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="partially_received">Partially received</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      <label className="form-group">
        <span className="form-label">Notes</span>
        <textarea
          className="form-textarea"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
        />
      </label>

      <div className="space-y-3">
        {form.line_items.map((line, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-4 items-end">
            <label className="form-group">
              <span className="form-label">Item</span>
              <select
                className="form-select"
                value={line.item_id}
                onChange={(event) => updateLine(index, { item_id: event.target.value })}
              >
                <option value="">Select item</option>
                {itemOptions.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.label}
                    {item.subtitle ? ` - ${item.subtitle}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-group">
              <span className="form-label">Ordered qty</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={line.ordered_quantity}
                onChange={(event) => updateLine(index, { ordered_quantity: event.target.value })}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Unit cost</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={line.unit_cost}
                onChange={(event) => updateLine(index, { unit_cost: event.target.value })}
              />
            </label>
            <Button type="button" variant="ghost" onClick={() => removeLine(index)}>
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 inline-flex gap-2">
        <Button type="button" variant="ghost" onClick={addLine}>
          Add PO line
        </Button>
      </div>

      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create purchase order"}
        </Button>
      </div>
    </Card>
  );
}
