import type { Dispatch, SetStateAction } from "react";
import type { SupplierRecord } from "@/features/stores/types/store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function SupplierFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
  editing,
  onCancel,
}: {
  form: Omit<SupplierRecord, "id">;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<Omit<SupplierRecord, "id">>>;
  submitting: boolean;
  editing?: boolean;
  onCancel?: () => void;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>{editing ? "Edit supplier" : "New supplier"}</h3>
        <p className="mt-2 text-sm">Manage supplier contacts for purchase orders and receivings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-group">
          <span className="form-label">Supplier name</span>
          <input
            className="form-input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <label className="form-group">
          <span className="form-label">Contact name</span>
          <input
            className="form-input"
            value={form.contact_name}
            onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))}
          />
        </label>

        <label className="form-group">
          <span className="form-label">Email</span>
          <input
            type="email"
            className="form-input"
            value={form.email ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label className="form-group">
          <span className="form-label">Phone</span>
          <input
            className="form-input"
            value={form.phone ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>

        <label className="form-group md:col-span-2">
          <span className="form-label">Address</span>
          <input
            className="form-input"
            value={form.address ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          />
        </label>

        <label className="form-group md:col-span-2">
          <span className="form-label">Active</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            <span className="text-sm text-app-secondary">Supplier is active</span>
          </div>
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        {editing && onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : editing ? "Update supplier" : "Create supplier"}
        </Button>
      </div>
    </Card>
  );
}
