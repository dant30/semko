import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  DriverEmploymentStatus,
  DriverFormValues,
  DriverLicenseStatus,
} from "@/features/drivers/types/driver";
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

export function DriverFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
}: {
  form: DriverFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<DriverFormValues>>;
  submitting: boolean;
}) {
  const employmentStatuses: DriverEmploymentStatus[] = [
    "active",
    "on_leave",
    "suspended",
    "inactive",
    "terminated",
  ];
  const licenseStatuses: DriverLicenseStatus[] = ["valid", "expired", "suspended", "revoked"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Driver record</h3>
        <p className="mt-2 text-sm">
          Register a driver profile together with the primary driving license details in one step.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Employee ID">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, employee_id: event.target.value }))} value={form.employee_id} />
        </FormField>
        <FormField label="National ID">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, national_id: event.target.value }))} value={form.national_id} />
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
        <FormField label="Alternate phone">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, alternate_phone_number: event.target.value }))} value={form.alternate_phone_number} />
        </FormField>
        <FormField label="Email">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
        </FormField>
        <FormField label="Employment status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, employment_status: event.target.value as DriverEmploymentStatus }))} value={form.employment_status}>
            {employmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Date of birth">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))} type="date" value={form.date_of_birth} />
        </FormField>
        <FormField label="Hire date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, hire_date: event.target.value }))} type="date" value={form.hire_date} />
        </FormField>
        <FormField label="Emergency contact name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, emergency_contact_name: event.target.value }))} value={form.emergency_contact_name} />
        </FormField>
        <FormField label="Emergency contact phone">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, emergency_contact_phone: event.target.value }))} value={form.emergency_contact_phone} />
        </FormField>
      </div>

      <FormField label="Address">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} value={form.address} />
      </FormField>

      <div className="mb-4 mt-6">
        <h4>License details</h4>
        <p className="mt-1 text-sm text-app-secondary">
          These details are stored as the linked driver license record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="License number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, license_number: event.target.value } }))} value={form.license.license_number} />
        </FormField>
        <FormField label="License class">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, license_class: event.target.value } }))} value={form.license.license_class} />
        </FormField>
        <FormField label="Issue date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, issue_date: event.target.value } }))} type="date" value={form.license.issue_date} />
        </FormField>
        <FormField label="Expiry date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, expiry_date: event.target.value } }))} type="date" value={form.license.expiry_date} />
        </FormField>
        <FormField label="License status">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, status: event.target.value as DriverLicenseStatus } }))} value={form.license.status}>
            {licenseStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Issuing authority">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, issuing_authority: event.target.value } }))} value={form.license.issuing_authority} />
        </FormField>
      </div>

      <FormField label="License restrictions">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, restrictions: event.target.value } }))} value={form.license.restrictions} />
      </FormField>
      <FormField label="Operational notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <FormField label="License notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, license: { ...current.license, notes: event.target.value } }))} value={form.license.notes} />
      </FormField>

      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create driver"}
        </Button>
      </div>
    </Card>
  );
}
