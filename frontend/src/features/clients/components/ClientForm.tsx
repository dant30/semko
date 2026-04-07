import { Save } from "lucide-react";
import type { FormEvent } from "react";

import type { ClientFormValues } from "@/features/clients/types/client";
import { Badge, Card, Checkbox, Input, Select, Textarea } from "@/shared/components/ui";
import FormActions from "@/shared/components/forms/FormActions";
import { FormField } from "@/shared/components/forms/FormField";
import { FormSection } from "@/shared/components/forms/FormSection";

interface ClientFormProps {
  error?: string;
  fieldErrors: Partial<Record<keyof ClientFormValues, string>>;
  formValues: ClientFormValues;
  isLoading?: boolean;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  updateField: <K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]) => void;
}

const clientTypeOptions = [
  { value: "corporate", label: "Corporate" },
  { value: "individual", label: "Individual" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export function ClientForm({
  error,
  fieldErrors,
  formValues,
  isLoading = false,
  isSubmitting = false,
  mode,
  onCancel,
  onSubmit,
  updateField,
}: ClientFormProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="rounded-[2rem] p-6">
          <div className="space-y-4">
            <div className="h-6 w-2/5 rounded-lg bg-surface-subtle" />
            <div className="h-4 w-full rounded-lg bg-surface-subtle" />
            <div className="h-4 w-full rounded-lg bg-surface-subtle" />
          </div>
        </Card>
        <Card className="rounded-[2rem] p-6">
          <div className="space-y-4">
            <div className="h-6 w-2/5 rounded-lg bg-surface-subtle" />
            <div className="h-4 w-full rounded-lg bg-surface-subtle" />
            <div className="h-4 w-full rounded-lg bg-surface-subtle" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card className="rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">
              {mode === "create" ? "New client" : "Client details"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {mode === "create" ? "Add a new client" : "Update client information"}
            </h2>
          </div>
          <Badge variant={formValues.status === "active" ? "success" : formValues.status === "suspended" ? "warning" : "neutral"}>
            {formValues.status}
          </Badge>
        </div>

        <FormSection
          className="mt-6"
          title="Basic client information"
          description="Capture the client name, code, type, and primary contact details."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="name" label="Client name" required errors={fieldErrors.name}>
              <Input
                id="name"
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </FormField>

            <FormField id="code" label="Client code" required errors={fieldErrors.code}>
              <Input
                id="code"
                value={formValues.code}
                onChange={(event) => updateField("code", event.target.value)}
                required
              />
            </FormField>

            <FormField id="client_type" label="Client type" required errors={fieldErrors.client_type}>
              <Select
                id="client_type"
                value={formValues.client_type}
                options={clientTypeOptions}
                onChange={(event) => updateField("client_type", event.target.value as ClientFormValues["client_type"])}
              />
            </FormField>

            <FormField id="contact_person" label="Contact person" errors={fieldErrors.contact_person}>
              <Input
                id="contact_person"
                value={formValues.contact_person}
                onChange={(event) => updateField("contact_person", event.target.value)}
              />
            </FormField>
          </div>
        </FormSection>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <FormSection
          title="Contact and address"
          description="Add the client's phone, email, and location details for follow up and logistics."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="phone_number" label="Primary phone" errors={fieldErrors.phone_number}>
              <Input
                id="phone_number"
                value={formValues.phone_number}
                onChange={(event) => updateField("phone_number", event.target.value)}
              />
            </FormField>

            <FormField id="alternate_phone_number" label="Alternate phone" errors={fieldErrors.alternate_phone_number}>
              <Input
                id="alternate_phone_number"
                value={formValues.alternate_phone_number}
                onChange={(event) => updateField("alternate_phone_number", event.target.value)}
              />
            </FormField>

            <FormField id="email" label="Email" errors={fieldErrors.email}>
              <Input
                id="email"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>

            <FormField id="town" label="Town" errors={fieldErrors.town}>
              <Input
                id="town"
                value={formValues.town}
                onChange={(event) => updateField("town", event.target.value)}
              />
            </FormField>

            <FormField id="county" label="County" errors={fieldErrors.county}>
              <Input
                id="county"
                value={formValues.county}
                onChange={(event) => updateField("county", event.target.value)}
              />
            </FormField>

            <FormField id="address" label="Address" errors={fieldErrors.address}>
              <Textarea
                id="address"
                value={formValues.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </FormField>

            <FormField id="notes" label="Notes" errors={fieldErrors.notes}>
              <Textarea
                id="notes"
                value={formValues.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </FormField>
          </div>
        </FormSection>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <FormSection
          title="Status and visibility"
          description="Set the client's current status and whether the record should be treated as active."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <FormField id="status" label="Status" required errors={fieldErrors.status}>
              <Select
                id="status"
                value={formValues.status}
                options={statusOptions}
                onChange={(event) => updateField("status", event.target.value as ClientFormValues["status"])}
              />
            </FormField>

            <FormField id="is_active" label="Active record" errors={fieldErrors.is_active}>
              <Checkbox
                id="is_active"
                checked={formValues.is_active}
                onChange={(event) => updateField("is_active", event.target.checked)}
                label="Active"
              />
            </FormField>
          </div>
        </FormSection>
      </Card>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <FormActions
        primaryLabel={isSubmitting ? (mode === "create" ? "Creating client..." : "Saving changes...") : mode === "create" ? "Create client" : "Save changes"}
        primaryProps={{ type: "submit", leftIcon: <Save className="h-4 w-4" /> }}
        secondaryLabel="Cancel"
        secondaryProps={{ type: "button", onClick: onCancel }}
        loading={isSubmitting}
      />
    </form>
  );
}
