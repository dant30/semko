import { FileUp, Save } from "lucide-react";

import type { TripFormValues, TripLookupOption } from "@/features/trips/types/trip";
import { Button, Card, Skeleton } from "@/shared/components/ui";

interface TripFormProps {
  error?: string;
  fieldErrors: Partial<Record<keyof TripFormValues, string>>;
  filteredQuarries: TripLookupOption[];
  formValues: TripFormValues;
  isLoading?: boolean;
  isSubmitting?: boolean;
  lookups: {
    clients: TripLookupOption[];
    drivers: TripLookupOption[];
    materials: TripLookupOption[];
    vehicles: TripLookupOption[];
  };
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  updateField: <K extends keyof TripFormValues>(field: K, value: TripFormValues[K]) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="form-error">{message}</p>;
}

function LookupSelect({
  error,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: TripLookupOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <select className="form-select" onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={String(option.id)}>
            {option.label}
            {option.subtitle ? ` - ${option.subtitle}` : ""}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export function TripForm({
  error,
  fieldErrors,
  filteredQuarries,
  formValues,
  isLoading = false,
  isSubmitting = false,
  lookups,
  mode,
  onCancel,
  onSubmit,
  updateField,
}: TripFormProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>{mode === "create" ? "Trip registration" : "Trip update"}</h3>
          <p className="mt-2 text-sm">
            Capture dispatch identity, trip ownership, quantities, and operational status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="form-group">
            <span className="form-label">Trip number</span>
            <input
              className="form-input"
              onChange={(event) => updateField("trip_number", event.target.value)}
              required
              value={formValues.trip_number}
            />
            <FieldError message={fieldErrors.trip_number} />
          </label>

          <label className="form-group">
            <span className="form-label">Delivery note number</span>
            <input
              className="form-input"
              onChange={(event) => updateField("delivery_note_number", event.target.value)}
              required
              value={formValues.delivery_note_number}
            />
            <FieldError message={fieldErrors.delivery_note_number} />
          </label>

          <label className="form-group">
            <span className="form-label">Trip date</span>
            <input
              className="form-input"
              onChange={(event) => updateField("trip_date", event.target.value)}
              required
              type="date"
              value={formValues.trip_date}
            />
            <FieldError message={fieldErrors.trip_date} />
          </label>

          <LookupSelect
            error={fieldErrors.vehicle_id}
            label="Vehicle"
            onChange={(value) => updateField("vehicle_id", value)}
            options={lookups.vehicles}
            placeholder="Select vehicle"
            value={formValues.vehicle_id}
          />

          <LookupSelect
            error={fieldErrors.driver_id}
            label="Driver"
            onChange={(value) => updateField("driver_id", value)}
            options={lookups.drivers}
            placeholder="Select driver"
            value={formValues.driver_id}
          />

          <LookupSelect
            error={fieldErrors.client_id}
            label="Client"
            onChange={(value) => {
              updateField("client_id", value);
              updateField("quarry_id", "");
            }}
            options={lookups.clients}
            placeholder="Select client"
            value={formValues.client_id}
          />

          <LookupSelect
            error={fieldErrors.quarry_id}
            label="Quarry"
            onChange={(value) => updateField("quarry_id", value)}
            options={filteredQuarries}
            placeholder="Select quarry"
            value={formValues.quarry_id}
          />

          <LookupSelect
            error={fieldErrors.material_id}
            label="Material"
            onChange={(value) => updateField("material_id", value)}
            options={lookups.materials}
            placeholder="Select material"
            value={formValues.material_id}
          />

          <label className="form-group">
            <span className="form-label">Destination</span>
            <input
              className="form-input"
              onChange={(event) => updateField("destination", event.target.value)}
              required
              value={formValues.destination}
            />
            <FieldError message={fieldErrors.destination} />
          </label>
        </div>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>Commercial and workflow details</h3>
          <p className="mt-2 text-sm">
            Set quantity, pricing, workflow state, and whether the trip is currently active.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="form-group">
            <span className="form-label">Trip type</span>
            <select
              className="form-select"
              onChange={(event) =>
                updateField("trip_type", event.target.value as TripFormValues["trip_type"])
              }
              value={formValues.trip_type}
            >
              <option value="owned">Owned fleet</option>
              <option value="hired">Hired fleet</option>
            </select>
          </label>

          <label className="form-group">
            <span className="form-label">Status</span>
            <select
              className="form-select"
              onChange={(event) =>
                updateField("status", event.target.value as TripFormValues["status"])
              }
              value={formValues.status}
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In progress</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="form-group">
            <span className="form-label">Quantity unit</span>
            <input
              className="form-input"
              onChange={(event) => updateField("quantity_unit", event.target.value)}
              value={formValues.quantity_unit}
            />
          </label>

          <label className="form-group">
            <span className="form-label">Expected quantity</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("expected_quantity", event.target.value)}
              required
              step="0.01"
              type="number"
              value={formValues.expected_quantity}
            />
            <FieldError message={fieldErrors.expected_quantity} />
          </label>

          <label className="form-group">
            <span className="form-label">Agreed unit price</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("agreed_unit_price", event.target.value)}
              required
              step="0.01"
              type="number"
              value={formValues.agreed_unit_price}
            />
            <FieldError message={fieldErrors.agreed_unit_price} />
          </label>

          <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white/70 p-4 dark:bg-slate-900/70">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-app-secondary">
              <input
                checked={formValues.documents_verified}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                onChange={(event) => updateField("documents_verified", event.target.checked)}
                type="checkbox"
              />
              Documents verified
            </label>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-app-secondary">
              <input
                checked={formValues.is_active}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                onChange={(event) => updateField("is_active", event.target.checked)}
                type="checkbox"
              />
              Active trip
            </label>
          </div>
        </div>

        <label className="form-group mt-4">
          <span className="form-label">Remarks</span>
          <textarea
            className="form-textarea"
            onChange={(event) => updateField("remarks", event.target.value)}
            value={formValues.remarks}
          />
        </label>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>Document workflow</h3>
          <p className="mt-2 text-sm">
            Attach or replace the delivery note and maintain document verification state.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="form-group">
            <span className="form-label">Delivery note document</span>
            <input
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              className="form-input"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                updateField("delivery_note_file", file);
                updateField("delivery_note_file_name", file?.name || formValues.delivery_note_file_name);
              }}
              type="file"
            />
            <FieldError message={fieldErrors.delivery_note_file} />
          </label>
          <div className="rounded-2xl border border-dashed border-surface-border bg-white/70 px-4 py-3 text-sm text-app-secondary dark:bg-slate-900/70">
            <div className="inline-flex items-center gap-2">
              <FileUp className="h-4 w-4 text-accent-600" />
              <span>{formValues.delivery_note_file_name || "No document selected yet"}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>Weighbridge capture</h3>
          <p className="mt-2 text-sm">
            If weights are available, record quarry and site readings so discrepancy can be calculated.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="form-group">
            <span className="form-label">Quarry gross weight</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("quarry_gross_weight", event.target.value)}
              step="0.01"
              type="number"
              value={formValues.quarry_gross_weight}
            />
            <FieldError message={fieldErrors.quarry_gross_weight} />
          </label>
          <label className="form-group">
            <span className="form-label">Quarry tare weight</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("quarry_tare_weight", event.target.value)}
              step="0.01"
              type="number"
              value={formValues.quarry_tare_weight}
            />
            <FieldError message={fieldErrors.quarry_tare_weight} />
          </label>
          <label className="form-group">
            <span className="form-label">Site gross weight</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("site_gross_weight", event.target.value)}
              step="0.01"
              type="number"
              value={formValues.site_gross_weight}
            />
            <FieldError message={fieldErrors.site_gross_weight} />
          </label>
          <label className="form-group">
            <span className="form-label">Site tare weight</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) => updateField("site_tare_weight", event.target.value)}
              step="0.01"
              type="number"
              value={formValues.site_tare_weight}
            />
            <FieldError message={fieldErrors.site_tare_weight} />
          </label>
        </div>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>Discrepancy and cess controls</h3>
          <p className="mt-2 text-sm">
            Capture tolerance context and cess workflow notes for downstream operational review.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-group">
            <span className="form-label">Tolerance percentage</span>
            <input
              className="form-input"
              min="0"
              onChange={(event) =>
                updateField("discrepancy_tolerance_percentage", event.target.value)
              }
              step="0.01"
              type="number"
              value={formValues.discrepancy_tolerance_percentage}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Cess status</span>
            <select
              className="form-select"
              onChange={(event) => updateField("cess_status", event.target.value)}
              value={formValues.cess_status}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Discrepancy notes</span>
            <textarea
              className="form-textarea"
              onChange={(event) => updateField("discrepancy_notes", event.target.value)}
              value={formValues.discrepancy_notes}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Cess notes</span>
            <textarea
              className="form-textarea"
              onChange={(event) => updateField("cess_notes", event.target.value)}
              value={formValues.cess_notes}
            />
          </label>
        </div>
      </Card>

      {formValues.trip_type === "hired" ? (
        <Card className="rounded-[2rem] p-6">
          <div className="mb-6">
            <h3>Hired-trip settlement</h3>
            <p className="mt-2 text-sm">
              Provide owner and settlement details whenever this trip runs on hired fleet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="form-group xl:col-span-2">
              <span className="form-label">Owner name</span>
              <input
                className="form-input"
                onChange={(event) => updateField("hired_owner_name", event.target.value)}
                value={formValues.hired_owner_name}
              />
              <FieldError message={fieldErrors.hired_owner_name} />
            </label>
            <label className="form-group">
              <span className="form-label">Owner rate per trip</span>
              <input
                className="form-input"
                min="0"
                onChange={(event) =>
                  updateField("hired_owner_rate_per_trip", event.target.value)
                }
                step="0.01"
                type="number"
                value={formValues.hired_owner_rate_per_trip}
              />
              <FieldError message={fieldErrors.hired_owner_rate_per_trip} />
            </label>
            <label className="form-group">
              <span className="form-label">Settlement status</span>
              <select
                className="form-select"
                onChange={(event) =>
                  updateField("hired_settlement_status", event.target.value)
                }
                value={formValues.hired_settlement_status}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="settled">Settled</option>
              </select>
            </label>
          </div>

          <label className="form-group mt-4">
            <span className="form-label">Settlement notes</span>
            <textarea
              className="form-textarea"
              onChange={(event) => updateField("hired_trip_notes", event.target.value)}
              value={formValues.hired_trip_notes}
            />
          </label>
        </Card>
      ) : null}

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit" variant="primary">
          <Save className="h-4 w-4" />
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create trip"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
