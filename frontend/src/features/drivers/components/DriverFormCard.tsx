import { cloneElement, isValidElement, type ReactNode } from "react";

import type {
  DriverEmploymentStatus,
  DriverFormValues,
  DriverLicenseStatus,
} from "@/features/drivers/types/driver";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function FormField({ children, label }: { children: ReactNode; label: string }) {
  const childElement = isValidElement(children)
    ? cloneElement(children, { "aria-label": label, title: label })
    : children;

  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      {childElement}
    </label>
  );
}

export function DriverFormCard({
  form,
  onSubmit,
  updateField,
  submitting,
  isLoading,
  error,
  mode = "create",
  onCancel,
}: {
  form: DriverFormValues;
  onSubmit: () => void;
  updateField: <K extends keyof DriverFormValues>(field: K, value: DriverFormValues[K]) => void;
  submitting: boolean;
  isLoading?: boolean;
  error?: string;
  mode?: "create" | "edit";
  onCancel?: () => void;
}) {
  const employmentStatuses: DriverEmploymentStatus[] = [
    "active",
    "on_leave",
    "suspended",
    "inactive",
    "terminated",
  ];
  const licenseStatuses: DriverLicenseStatus[] = ["valid", "expired", "suspended", "revoked"];

  if (isLoading) {
    return (
      <Card className="rounded-[2rem] p-6">
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>{mode === "edit" ? "Edit driver record" : "Driver record"}</h3>
        <p className="mt-2 text-sm text-app-secondary">
          {mode === "edit"
            ? "Update the driver profile and license details in one place."
            : "Register a driver profile together with the primary driving license details in one step."}
        </p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Employee ID">
          <input
            className="form-input"
            title="Employee ID"
            onChange={(event) => updateField("employee_id", event.target.value)}
            value={form.employee_id}
          />
        </FormField>
        <FormField label="National ID">
          <input
            className="form-input"
            title="National ID"
            onChange={(event) => updateField("national_id", event.target.value)}
            value={form.national_id}
          />
        </FormField>
        <FormField label="First name">
          <input
            className="form-input"
            title="First name"
            onChange={(event) => updateField("first_name", event.target.value)}
            value={form.first_name}
          />
        </FormField>
        <FormField label="Last name">
          <input
            className="form-input"
            title="Last name"
            onChange={(event) => updateField("last_name", event.target.value)}
            value={form.last_name}
          />
        </FormField>
        <FormField label="Phone number">
          <input
            className="form-input"
            title="Phone number"
            onChange={(event) => updateField("phone_number", event.target.value)}
            value={form.phone_number}
          />
        </FormField>
        <FormField label="Alternate phone">
          <input
            className="form-input"
            title="Alternate phone"
            onChange={(event) => updateField("alternate_phone_number", event.target.value)}
            value={form.alternate_phone_number}
          />
        </FormField>
        <FormField label="Email">
          <input
            className="form-input"
            title="Email"
            onChange={(event) => updateField("email", event.target.value)}
            type="email"
            value={form.email}
          />
        </FormField>
        <FormField label="Employment status">
          <select
            className="form-select"
            title="Employment status"
            onChange={(event) => updateField("employment_status", event.target.value as DriverEmploymentStatus)}
            value={form.employment_status}
          >
            {employmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Date of birth">
          <input
            className="form-input"
            title="Date of birth"
            onChange={(event) => updateField("date_of_birth", event.target.value)}
            type="date"
            value={form.date_of_birth}
          />
        </FormField>
        <FormField label="Hire date">
          <input
            className="form-input"
            title="Hire date"
            onChange={(event) => updateField("hire_date", event.target.value)}
            type="date"
            value={form.hire_date}
          />
        </FormField>
        <FormField label="Emergency contact name">
          <input
            className="form-input"
            title="Emergency contact name"
            onChange={(event) => updateField("emergency_contact_name", event.target.value)}
            value={form.emergency_contact_name}
          />
        </FormField>
        <FormField label="Emergency contact phone">
          <input
            className="form-input"
            title="Emergency contact phone"
            onChange={(event) => updateField("emergency_contact_phone", event.target.value)}
            value={form.emergency_contact_phone}
          />
        </FormField>
      </div>

      <FormField label="Address">
        <textarea
          className="form-textarea"
          title="Address"
          onChange={(event) => updateField("address", event.target.value)}
          value={form.address}
        />
      </FormField>

      <div className="mb-4 mt-6">
        <h4>License details</h4>
        <p className="mt-1 text-sm text-app-secondary">
          These details are stored as the linked driver license record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="License number">
          <input
            className="form-input"
            title="License number"
            onChange={(event) => updateField("license", { ...form.license, license_number: event.target.value })}
            value={form.license.license_number}
          />
        </FormField>
        <FormField label="License class">
          <input
            className="form-input"
            title="License class"
            onChange={(event) => updateField("license", { ...form.license, license_class: event.target.value })}
            value={form.license.license_class}
          />
        </FormField>
        <FormField label="Issue date">
          <input
            className="form-input"
            title="Issue date"
            onChange={(event) => updateField("license", { ...form.license, issue_date: event.target.value })}
            type="date"
            value={form.license.issue_date}
          />
        </FormField>
        <FormField label="Expiry date">
          <input
            className="form-input"
            title="Expiry date"
            onChange={(event) => updateField("license", { ...form.license, expiry_date: event.target.value })}
            type="date"
            value={form.license.expiry_date}
          />
        </FormField>
        <FormField label="License status">
          <select
            className="form-select"
            title="License status"
            onChange={(event) => updateField("license", { ...form.license, status: event.target.value as DriverLicenseStatus })}
            value={form.license.status}
          >
            {licenseStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Issuing authority">
          <input
            className="form-input"
            title="Issuing authority"
            onChange={(event) => updateField("license", { ...form.license, issuing_authority: event.target.value })}
            value={form.license.issuing_authority}
          />
        </FormField>
      </div>

      <FormField label="License restrictions">
        <textarea
          className="form-textarea"
          title="License restrictions"
          onChange={(event) => updateField("license", { ...form.license, restrictions: event.target.value })}
          value={form.license.restrictions}
        />
      </FormField>
      <FormField label="Operational notes">
        <textarea
          className="form-textarea"
          title="Operational notes"
          onChange={(event) => updateField("notes", event.target.value)}
          value={form.notes}
        />
      </FormField>
      <FormField label="License notes">
        <textarea
          className="form-textarea"
          title="License notes"
          onChange={(event) => updateField("license", { ...form.license, notes: event.target.value })}
          value={form.license.notes}
        />
      </FormField>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save driver" : "Create driver"}
        </Button>
      </div>
    </Card>
  );
}
