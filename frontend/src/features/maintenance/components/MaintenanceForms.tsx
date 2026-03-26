import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  MaintenanceScheduleFormValues,
  MaintenanceType,
  MechanicEmploymentType,
  MechanicFormValues,
  PartUsedFormValues,
  ScheduleStatus,
  ServiceRecordFormValues,
  ServiceStatus,
} from "@/features/maintenance/types/maintenance";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface LookupOption {
  id: number;
  label: string;
  subtitle?: string;
}

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
  options: LookupOption[];
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

export function MechanicFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
}: {
  form: MechanicFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<MechanicFormValues>>;
  submitting: boolean;
}) {
  const employmentTypes: MechanicEmploymentType[] = ["internal", "external", "contract"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Mechanic</h3>
        <p className="mt-2 text-sm">Register workshop personnel and external service partners.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Employee ID">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, employee_id: event.target.value }))} value={form.employee_id} />
        </FormField>
        <FormField label="Employment type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, employment_type: event.target.value as MechanicEmploymentType }))} value={form.employment_type}>
            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="First name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} value={form.first_name} />
        </FormField>
        <FormField label="Last name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} value={form.last_name} />
        </FormField>
        <FormField label="Phone number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} value={form.phone_number} />
        </FormField>
        <FormField label="Email">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
        </FormField>
        <FormField label="Specialization">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))} value={form.specialization} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create mechanic"}
        </Button>
      </div>
    </Card>
  );
}

export function ScheduleFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
  vehicles,
}: {
  form: MaintenanceScheduleFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<MaintenanceScheduleFormValues>>;
  submitting: boolean;
  vehicles: LookupOption[];
}) {
  const maintenanceTypes: MaintenanceType[] = [
    "preventive",
    "corrective",
    "inspection",
    "tyre",
    "engine",
    "other",
  ];
  const statuses: ScheduleStatus[] = ["scheduled", "due", "overdue", "completed", "cancelled"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Maintenance schedule</h3>
        <p className="mt-2 text-sm">Plan maintenance work based on time, distance, and current odometer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Vehicle">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, vehicle_id: value }))} options={vehicles} placeholder="Select vehicle" value={form.vehicle_id} />
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Title">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} value={form.title} />
        </FormField>
        <FormField label="Maintenance type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, maintenance_type: event.target.value as MaintenanceType }))} value={form.maintenance_type}>
            {maintenanceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Interval days">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, interval_days: event.target.value }))} type="number" value={form.interval_days} />
        </FormField>
        <FormField label="Interval km">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, interval_km: event.target.value }))} type="number" value={form.interval_km} />
        </FormField>
        <FormField label="Last service date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, last_service_date: event.target.value }))} type="date" value={form.last_service_date} />
        </FormField>
        <FormField label="Last service odometer">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, last_service_odometer: event.target.value }))} step="0.01" type="number" value={form.last_service_odometer} />
        </FormField>
        <FormField label="Current odometer">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, current_odometer: event.target.value }))} step="0.01" type="number" value={form.current_odometer} />
        </FormField>
        <FormField label="Status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ScheduleStatus }))} value={form.status}>
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
          {submitting ? "Saving..." : "Create schedule"}
        </Button>
      </div>
    </Card>
  );
}

export function ServiceRecordFormCard({
  form,
  mechanics,
  onSubmit,
  schedules,
  setForm,
  submitting,
  vehicles,
}: {
  form: ServiceRecordFormValues;
  mechanics: LookupOption[];
  onSubmit: () => void;
  schedules: LookupOption[];
  setForm: Dispatch<SetStateAction<ServiceRecordFormValues>>;
  submitting: boolean;
  vehicles: LookupOption[];
}) {
  const statuses: ServiceStatus[] = ["open", "in_progress", "completed", "cancelled"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Service record</h3>
        <p className="mt-2 text-sm">Track maintenance execution, mechanics, and labor/external costs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Vehicle">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, vehicle_id: value }))} options={vehicles} placeholder="Select vehicle" value={form.vehicle_id} />
        </FormField>
        <FormField label="Schedule">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, schedule_id: value }))} options={schedules} placeholder="Optional schedule" value={form.schedule_id} />
        </FormField>
        <FormField label="Mechanic">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, mechanic_id: value }))} options={mechanics} placeholder="Select mechanic" value={form.mechanic_id} />
        </FormField>
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Title">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} value={form.title} />
        </FormField>
        <FormField label="Service date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, service_date: event.target.value }))} type="date" value={form.service_date} />
        </FormField>
        <FormField label="Odometer reading">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, odometer_reading: event.target.value }))} step="0.01" type="number" value={form.odometer_reading} />
        </FormField>
        <FormField label="Status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ServiceStatus }))} value={form.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Labor cost">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, labor_cost: event.target.value }))} step="0.01" type="number" value={form.labor_cost} />
        </FormField>
        <FormField label="External cost">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, external_cost: event.target.value }))} step="0.01" type="number" value={form.external_cost} />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Diagnosis">
          <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))} value={form.diagnosis} />
        </FormField>
        <FormField label="Work performed">
          <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, work_performed: event.target.value }))} value={form.work_performed} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create service record"}
        </Button>
      </div>
    </Card>
  );
}

export function PartUsedFormCard({
  form,
  items,
  onSubmit,
  serviceRecords,
  setForm,
  submitting,
}: {
  form: PartUsedFormValues;
  items: LookupOption[];
  onSubmit: () => void;
  serviceRecords: LookupOption[];
  setForm: Dispatch<SetStateAction<PartUsedFormValues>>;
  submitting: boolean;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Part used</h3>
        <p className="mt-2 text-sm">Capture stores consumption against a maintenance service record.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Service record">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, service_record_id: value }))} options={serviceRecords} placeholder="Select service record" value={form.service_record_id} />
        </FormField>
        <FormField label="Stores item">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, item_id: value }))} options={items} placeholder="Select stores item" value={form.item_id} />
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
          {submitting ? "Saving..." : "Record part usage"}
        </Button>
      </div>
    </Card>
  );
}
