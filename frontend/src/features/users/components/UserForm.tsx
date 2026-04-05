// frontend/src/features/users/components/UserForm.tsx
import { Save } from "lucide-react";

import type { UserFormValues, RoleRecord } from "@/features/users/types/user";
import { Button, Card, Skeleton } from "@/shared/components/ui";

interface UserFormProps {
  error?: string;
  fieldErrors: Partial<Record<keyof UserFormValues, string>>;
  formValues: UserFormValues;
  isLoading?: boolean;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  roles: RoleRecord[];
  updateField: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="form-error">{message}</p>;
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

function RoleSelect({
  error,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: number | "") => void;
  options: RoleRecord[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <select
        className="form-select"
        onChange={(event) => {
          const selected = event.target.value;
          onChange(selected === "" ? "" : Number(selected));
        }}
        value={value}
        aria-label="Role assignment"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={String(option.id)}>
            {option.name} - {getRoleCardDescription(option)}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
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
          <h3>User account details</h3>
          <p className="mt-2 text-sm">
            Create and manage user accounts with role-based access and authentication settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-group">
            <span className="form-label">Username</span>
            <input
              className="form-input"
              onChange={(event) => updateField("username", event.target.value)}
              required
              value={formValues.username}
            />
            <FieldError message={fieldErrors.username} />
          </label>

          <label className="form-group">
            <span className="form-label">Email</span>
            <input
              className="form-input"
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={formValues.email}
            />
            <FieldError message={fieldErrors.email} />
          </label>

          <label className="form-group">
            <span className="form-label">First name</span>
            <input
              className="form-input"
              onChange={(event) => updateField("first_name", event.target.value)}
              required
              value={formValues.first_name}
            />
            <FieldError message={fieldErrors.first_name} />
          </label>

          <label className="form-group">
            <span className="form-label">Last name</span>
            <input
              className="form-input"
              onChange={(event) => updateField("last_name", event.target.value)}
              required
              value={formValues.last_name}
            />
            <FieldError message={fieldErrors.last_name} />
          </label>

          <label className="form-group">
            <span className="form-label">Phone number</span>
            <input
              className="form-input"
              onChange={(event) => updateField("phone_number", event.target.value)}
              value={formValues.phone_number}
            />
            <FieldError message={fieldErrors.phone_number} />
          </label>

          <RoleSelect
            error={fieldErrors.role_id}
            label="Role"
            onChange={(value) => updateField("role_id", value)}
            options={roles}
            placeholder="Select role"
            value={String(formValues.role_id)}
          />
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
      </Card>

      <Card className="rounded-[2rem] p-6">
        <div className="mb-6">
          <h3>Authentication and access</h3>
          <p className="mt-2 text-sm">
            Set password requirements and account status for secure user management.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-group">
            <span className="form-label">Password</span>
            <input
              className="form-input"
              onChange={(event) => updateField("password", event.target.value)}
              required={mode === "create"}
              type="password"
              value={formValues.password}
            />
            <FieldError message={fieldErrors.password} />
          </label>

          <label className="form-group">
            <span className="form-label">Confirm password</span>
            <input
              className="form-input"
              onChange={(event) => updateField("password_confirm", event.target.value)}
              required={mode === "create"}
              type="password"
              value={formValues.password_confirm}
            />
            <FieldError message={fieldErrors.password_confirm} />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-surface-border bg-white/70 p-4 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={formValues.is_active}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => updateField("is_active", event.target.checked)}
              type="checkbox"
            />
            Active account
          </label>

          <label className="inline-flex items-center gap-3 rounded-2xl border border-surface-border bg-white/70 p-4 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={formValues.is_staff}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => updateField("is_staff", event.target.checked)}
              type="checkbox"
            />
            Admin (staff)
          </label>

          <label className="inline-flex items-center gap-3 rounded-2xl border border-surface-border bg-white/70 p-4 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={formValues.must_change_password}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => updateField("must_change_password", event.target.checked)}
              type="checkbox"
            />
            Must change password
          </label>
        </div>
      </Card>

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
              ? "Create user"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}