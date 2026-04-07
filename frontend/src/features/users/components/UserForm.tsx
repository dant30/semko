// frontend/src/features/users/components/UserForm.tsx
import { Save } from "lucide-react";
import type { FormEvent } from "react";

import type { UserFormValues, RoleRecord } from "@/features/users/types/user";
import { Card, Checkbox, Input, Select, Skeleton } from "@/shared/components/ui";
import { FormActions, FormField, FormSection } from "@/shared/components/forms";

interface UserFormProps {
  error?: string;
  fieldErrors: Partial<Record<keyof UserFormValues, string>>;
  formValues: UserFormValues;
  isLoading?: boolean;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roles: RoleRecord[];
  updateField: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
}

function getRoleCardDescription(role: RoleRecord) {
  if (role.description) {
    return role.description;
  }

  const roleDescriptions: Record<string, string> = {
    ADMIN: "Full access to settings, users, reports and system configuration.",
    MANAGER: "Manage teams, approve workflows, and monitor key performance metrics.",
    DRIVER: "Track and complete assignments, log route activity, and update delivery statuses.",
    ANALYST: "View dashboards and reports, with readonly insights to support decisions.",
    STAFF: "Day-to-day operations permissions for standard task execution.",
  };

  return roleDescriptions[role.code?.toUpperCase()] || "Standard role permissions for business users.";
}

export function UserForm({
  error,
  fieldErrors,
  formValues,
  isLoading = false,
  isSubmitting = false,
  mode,
  onCancel,
  onSubmit,
  roles,
  updateField,
}: UserFormProps) {
  const roleOptions = [
    { value: "", label: "Select role" },
    ...roles.map((role) => ({ value: String(role.id), label: role.name })),
  ];

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
        <FormSection
          title="User account details"
          description="Create and manage user accounts with role-based access and authentication settings."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="username" label="Username" required errors={fieldErrors.username}>
              <Input
                id="username"
                value={formValues.username}
                onChange={(event) => updateField("username", event.target.value)}
                required
              />
            </FormField>

            <FormField id="email" label="Email" required errors={fieldErrors.email}>
              <Input
                id="email"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </FormField>

            <FormField id="first_name" label="First name" required errors={fieldErrors.first_name}>
              <Input
                id="first_name"
                value={formValues.first_name}
                onChange={(event) => updateField("first_name", event.target.value)}
                required
              />
            </FormField>

            <FormField id="last_name" label="Last name" required errors={fieldErrors.last_name}>
              <Input
                id="last_name"
                value={formValues.last_name}
                onChange={(event) => updateField("last_name", event.target.value)}
                required
              />
            </FormField>

            <FormField id="phone_number" label="Phone number" errors={fieldErrors.phone_number}>
              <Input
                id="phone_number"
                value={formValues.phone_number}
                onChange={(event) => updateField("phone_number", event.target.value)}
              />
            </FormField>

            <FormField
              id="role_id"
              label="Role"
              errors={fieldErrors.role_id}
              hint="Pick the role that most closely matches the user's responsibilities."
            >
              <Select
                id="role_id"
                value={String(formValues.role_id)}
                options={roleOptions}
                onChange={(event) => {
                  const selected = event.target.value;
                  updateField("role_id", selected === "" ? "" : Number(selected));
                }}
              />
            </FormField>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-app-secondary">
              Pick the role that most closely matches the user's responsibilities. Role definitions are shown below for easier decision-making.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const selected = String(formValues.role_id) === String(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => updateField("role_id", role.id)}
                    className={`rounded-2xl border p-4 text-left transition hover:border-brand-500 hover:bg-brand-50 ${
                      selected ? "border-brand-600 bg-brand-100" : "border-surface-border bg-white"
                    }`}
                  >
                    <div className="text-sm font-semibold">{role.name}</div>
                    <div className="mt-1 text-xs text-app-secondary">{getRoleCardDescription(role)}</div>
                    {role.permissions?.length ? (
                      <div className="mt-2 text-xs opacity-80">
                        <strong>Permissions:</strong> {role.permissions.join(", ")}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </FormSection>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <FormSection
          title="Authentication and access"
          description="Set password requirements and account status for secure user management."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="password" label="Password" required={mode === "create"} errors={fieldErrors.password}>
              <Input
                id="password"
                type="password"
                value={formValues.password}
                onChange={(event) => updateField("password", event.target.value)}
                required={mode === "create"}
              />
            </FormField>

            <FormField
              id="password_confirm"
              label="Confirm password"
              required={mode === "create"}
              errors={fieldErrors.password_confirm}
            >
              <Input
                id="password_confirm"
                type="password"
                value={formValues.password_confirm}
                onChange={(event) => updateField("password_confirm", event.target.value)}
                required={mode === "create"}
              />
            </FormField>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Checkbox
              id="is_active"
              checked={formValues.is_active}
              onChange={(event) => updateField("is_active", event.target.checked)}
              label="Active account"
            />
            <Checkbox
              id="is_staff"
              checked={formValues.is_staff}
              onChange={(event) => updateField("is_staff", event.target.checked)}
              label="Admin (staff)"
            />
            <Checkbox
              id="must_change_password"
              checked={formValues.must_change_password}
              onChange={(event) => updateField("must_change_password", event.target.checked)}
              label="Must change password"
            />
          </div>
        </FormSection>
      </Card>

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <FormActions
        primaryLabel={isSubmitting ? (mode === "create" ? "Creating user..." : "Saving changes...") : mode === "create" ? "Create user" : "Save changes"}
        primaryProps={{ type: "submit", leftIcon: <Save className="h-4 w-4" /> }}
        secondaryLabel="Cancel"
        secondaryProps={{ type: "button", onClick: onCancel }}
        loading={isSubmitting}
      />
    </form>
  );
}