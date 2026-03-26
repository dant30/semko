import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  AdjustmentFormValues,
  AdjustmentType,
  IssuedToType,
  RequisitionFormValues,
  RequisitionStatus,
  StockIssueFormValues,
  StockReceivingFormValues,
  StoreItemCategory,
  StoreItemFormValues,
  StoreUnitOfMeasure,
} from "@/features/stores/types/store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface ItemOption {
  id: number;
  label: string;
  subtitle?: string;
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function ItemSelect({
  itemOptions,
  onChange,
  value,
}: {
  itemOptions: ItemOption[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <select className="form-select" onChange={(event) => onChange(event.target.value)} value={value}>
      <option value="">Select item</option>
      {itemOptions.map((item) => (
        <option key={item.id} value={String(item.id)}>
          {item.label}
          {item.subtitle ? ` - ${item.subtitle}` : ""}
        </option>
      ))}
    </select>
  );
}

export function StoreItemFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
  editing,
  onCancel,
}: {
  form: StoreItemFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<StoreItemFormValues>>;
  submitting: boolean;
  editing?: boolean;
  onCancel?: () => void;
}) {
  const categories: StoreItemCategory[] = [
    "spare_part",
    "consumable",
    "tyre",
    "lubricant",
    "tooling",
    "other",
  ];
  const units: StoreUnitOfMeasure[] = ["piece", "litre", "kilogram", "set", "box"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>New store item</h3>
        <p className="mt-2 text-sm">
          Register stock-controlled items with reorder and issue guidance.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Item name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
        </FormField>
        <FormField label="Item code">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} value={form.code} />
        </FormField>
        <FormField label="Category">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as StoreItemCategory }))} value={form.category}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Unit of measure">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, unit_of_measure: event.target.value as StoreUnitOfMeasure }))} value={form.unit_of_measure}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Reorder level">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, reorder_level: event.target.value }))} step="0.01" type="number" value={form.reorder_level} />
        </FormField>
        <FormField label="Standard issue quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, standard_issue_quantity: event.target.value }))} step="0.01" type="number" value={form.standard_issue_quantity} />
        </FormField>
      </div>
      <FormField label="Description">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} value={form.description} />
      </FormField>
      <div className="mt-5 flex justify-end gap-2">
        {editing && onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : editing ? "Update item" : "Create item"}
        </Button>
      </div>
    </Card>
  );
}

export function ReceivingFormCard({
  form,
  itemOptions,
  onSubmit,
  setForm,
  submitting,
}: {
  form: StockReceivingFormValues;
  itemOptions: ItemOption[];
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<StockReceivingFormValues>>;
  submitting: boolean;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Stock receiving</h3>
        <p className="mt-2 text-sm">Record inward stock from suppliers and update stock visibility.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Item">
          <ItemSelect itemOptions={itemOptions} onChange={(value) => setForm((current) => ({ ...current, item_id: value }))} value={form.item_id} />
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Received date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, received_date: event.target.value }))} type="date" value={form.received_date} />
        </FormField>
        <FormField label="Supplier name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, supplier_name: event.target.value }))} value={form.supplier_name} />
        </FormField>
        <FormField label="Quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} step="0.01" type="number" value={form.quantity} />
        </FormField>
        <FormField label="Unit cost">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, unit_cost: event.target.value }))} step="0.01" type="number" value={form.unit_cost} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Record receiving"}
        </Button>
      </div>
    </Card>
  );
}

export function RequisitionFormCard({
  form,
  itemOptions,
  onSubmit,
  setForm,
  submitting,
}: {
  form: RequisitionFormValues;
  itemOptions: ItemOption[];
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<RequisitionFormValues>>;
  submitting: boolean;
}) {
  const statuses: RequisitionStatus[] = [
    "draft",
    "pending_approval",
    "approved",
    "partially_issued",
    "fulfilled",
    "rejected",
    "cancelled",
  ];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>New requisition</h3>
        <p className="mt-2 text-sm">Capture internal demand and approval status for stock movement.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Item">
          <ItemSelect itemOptions={itemOptions} onChange={(value) => setForm((current) => ({ ...current, item_id: value }))} value={form.item_id} />
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Requested for">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, requested_for: event.target.value }))} value={form.requested_for} />
        </FormField>
        <FormField label="Needed by">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, needed_by: event.target.value }))} type="date" value={form.needed_by} />
        </FormField>
        <FormField label="Requested quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, quantity_requested: event.target.value }))} step="0.01" type="number" value={form.quantity_requested} />
        </FormField>
        <FormField label="Approved quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, quantity_approved: event.target.value }))} step="0.01" type="number" value={form.quantity_approved} />
        </FormField>
        <FormField label="Status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as RequisitionStatus }))} value={form.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create requisition"}
        </Button>
      </div>
    </Card>
  );
}

export function IssueFormCard({
  form,
  itemOptions,
  onSubmit,
  requisitionOptions,
  setForm,
  submitting,
}: {
  form: StockIssueFormValues;
  itemOptions: ItemOption[];
  onSubmit: () => void;
  requisitionOptions: Array<{ id: number; label: string }>;
  setForm: Dispatch<SetStateAction<StockIssueFormValues>>;
  submitting: boolean;
}) {
  const issueTargets: IssuedToType[] = ["driver", "vehicle", "department", "workshop", "other"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Stock issue</h3>
        <p className="mt-2 text-sm">Issue stock against direct demand or a linked approved requisition.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Item">
          <ItemSelect itemOptions={itemOptions} onChange={(value) => setForm((current) => ({ ...current, item_id: value }))} value={form.item_id} />
        </FormField>
        <FormField label="Requisition">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, requisition_id: event.target.value }))} value={form.requisition_id}>
            <option value="">No requisition</option>
            {requisitionOptions.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Issue date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, issue_date: event.target.value }))} type="date" value={form.issue_date} />
        </FormField>
        <FormField label="Quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} step="0.01" type="number" value={form.quantity} />
        </FormField>
        <FormField label="Unit cost">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, unit_cost: event.target.value }))} step="0.01" type="number" value={form.unit_cost} />
        </FormField>
        <FormField label="Issued to type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, issued_to_type: event.target.value as IssuedToType }))} value={form.issued_to_type}>
            {issueTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Issued to name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, issued_to_name: event.target.value }))} value={form.issued_to_name} />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Purpose">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))} value={form.purpose} />
        </FormField>
        <FormField label="Notes">
          <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
        </FormField>
      </div>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Record issue"}
        </Button>
      </div>
    </Card>
  );
}

export function AdjustmentFormCard({
  form,
  itemOptions,
  onSubmit,
  setForm,
  submitting,
}: {
  form: AdjustmentFormValues;
  itemOptions: ItemOption[];
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<AdjustmentFormValues>>;
  submitting: boolean;
}) {
  const adjustmentTypes: AdjustmentType[] = ["increase", "decrease"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Stock adjustment</h3>
        <p className="mt-2 text-sm">Capture corrections, losses, or inventory count realignments.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Item">
          <ItemSelect itemOptions={itemOptions} onChange={(value) => setForm((current) => ({ ...current, item_id: value }))} value={form.item_id} />
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Adjustment date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, adjustment_date: event.target.value }))} type="date" value={form.adjustment_date} />
        </FormField>
        <FormField label="Adjustment type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, adjustment_type: event.target.value as AdjustmentType }))} value={form.adjustment_type}>
            {adjustmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Quantity">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} step="0.01" type="number" value={form.quantity} />
        </FormField>
        <FormField label="Reason">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} value={form.reason} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Record adjustment"}
        </Button>
      </div>
    </Card>
  );
}
