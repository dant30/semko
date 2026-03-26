import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  OwnershipType,
  VehicleFormValues,
  VehicleLookupOption,
  VehicleOwnershipFormValues,
  VehicleStatus,
  VehicleTypeFormValues,
} from "@/features/vehicles/types/vehicle";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function LookupSelect({
  onChange,
  options,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  options: VehicleLookupOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <select className="form-select" onChange={(event) => onChange(event.target.value)} value={value}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={String(option.id)}>
          {option.label}
          {option.subtitle ? ` - ${option.subtitle}` : ""}
        </option>
      ))}
    </select>
  );
}

export function VehicleFleetFormCard({
  form,
  onSubmit,
  ownershipOptions,
  setForm,
  submitting,
  typeOptions,
}: {
  form: VehicleFormValues;
  onSubmit: () => void;
  ownershipOptions: VehicleLookupOption[];
  setForm: Dispatch<SetStateAction<VehicleFormValues>>;
  submitting: boolean;
  typeOptions: VehicleLookupOption[];
}) {
  const statuses: VehicleStatus[] = ["active", "maintenance", "inactive", "retired"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Fleet record</h3>
        <p className="mt-2 text-sm">
          Register operational fleet units with type, ownership, expiry, and readiness metadata.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Registration number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, registration_number: event.target.value }))} value={form.registration_number} />
        </FormField>
        <FormField label="Fleet number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, fleet_number: event.target.value }))} value={form.fleet_number} />
        </FormField>
        <FormField label="Vehicle type">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, vehicle_type_id: value }))} options={typeOptions} placeholder="Select vehicle type" value={form.vehicle_type_id} />
        </FormField>
        <FormField label="Ownership">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, ownership_id: value }))} options={ownershipOptions} placeholder="Select ownership record" value={form.ownership_id} />
        </FormField>
        <FormField label="Make">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, make: event.target.value }))} value={form.make} />
        </FormField>
        <FormField label="Model">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} value={form.model} />
        </FormField>
        <FormField label="Year">
          <input className="form-input" min="1980" onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))} type="number" value={form.year} />
        </FormField>
        <FormField label="Capacity tonnes">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, capacity_tonnes: event.target.value }))} step="0.01" type="number" value={form.capacity_tonnes} />
        </FormField>
        <FormField label="Chassis number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, chassis_number: event.target.value }))} value={form.chassis_number} />
        </FormField>
        <FormField label="Engine number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, engine_number: event.target.value }))} value={form.engine_number} />
        </FormField>
        <FormField label="Color">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} value={form.color} />
        </FormField>
        <FormField label="Status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as VehicleStatus }))} value={form.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Insurance expiry">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, insurance_expiry: event.target.value }))} type="date" value={form.insurance_expiry} />
        </FormField>
        <FormField label="Inspection expiry">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, inspection_expiry: event.target.value }))} type="date" value={form.inspection_expiry} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create vehicle"}
        </Button>
      </div>
    </Card>
  );
}

export function VehicleTypeFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
}: {
  form: VehicleTypeFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<VehicleTypeFormValues>>;
  submitting: boolean;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Vehicle type</h3>
        <p className="mt-2 text-sm">
          Define fleet classes with standard codes, axle counts, and default carrying capacity.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
        </FormField>
        <FormField label="Code">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} value={form.code} />
        </FormField>
        <FormField label="Default capacity tonnes">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, default_capacity_tonnes: event.target.value }))} step="0.01" type="number" value={form.default_capacity_tonnes} />
        </FormField>
        <FormField label="Axle count">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, axle_count: event.target.value }))} type="number" value={form.axle_count} />
        </FormField>
      </div>
      <FormField label="Description">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} value={form.description} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create vehicle type"}
        </Button>
      </div>
    </Card>
  );
}

export function VehicleOwnershipFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
}: {
  form: VehicleOwnershipFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<VehicleOwnershipFormValues>>;
  submitting: boolean;
}) {
  const ownershipTypes: OwnershipType[] = ["company", "leased", "contracted", "hired", "other"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Ownership record</h3>
        <p className="mt-2 text-sm">
          Capture ownership and contract details for company, leased, hired, and contracted units.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
        </FormField>
        <FormField label="Ownership type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, ownership_type: event.target.value as OwnershipType }))} value={form.ownership_type}>
            {ownershipTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Contact person">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, contact_person: event.target.value }))} value={form.contact_person} />
        </FormField>
        <FormField label="Phone number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} value={form.phone_number} />
        </FormField>
        <FormField label="Email">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
        </FormField>
        <FormField label="Contract reference">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, contract_reference: event.target.value }))} value={form.contract_reference} />
        </FormField>
        <FormField label="Effective from">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, effective_from: event.target.value }))} type="date" value={form.effective_from} />
        </FormField>
        <FormField label="Effective to">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, effective_to: event.target.value }))} type="date" value={form.effective_to} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create ownership"}
        </Button>
      </div>
    </Card>
  );
}
