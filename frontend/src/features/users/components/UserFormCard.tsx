import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { RoleRecord, UserFormValues } from "@/features/users/types/user";
import { Badge } from "@/shared/components/ui/Badge";
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

export function UserFormCard({
  form,
  onSubmit,
  roles,
  setForm,
  submitting,
  editing,
  onCancel,
}: {
  form: UserFormValues;
  roles: RoleRecord[];
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<UserFormValues>>;
  submitting: boolean;
  editing?: boolean;
  onCancel?: () => void;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>User account</h3>
        <p className="mt-2 text-sm">
          Create and manage user accounts for your organization with role-based access.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Username">
          <input
            className="form-input"
            title="Username"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
        </FormField>
        <FormField label="Email">
          <input
            className="form-input"
            title="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </FormField>
        <FormField label="First name">
          <input
            className="form-input"
            title="First name"
            value={form.first_name}
            onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
          />
        </FormField>
        <FormField label="Last name">
          <input
            className="form-input"
            title="Last name"
            value={form.last_name}
            onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
          />
        </FormField>
        <FormField label="Phone number">
          <input
            className="form-input"
            title="Phone number"
            value={form.phone_number}
            onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))}
          />
        </FormField>
        <FormField label="Role">
          <select
            className="form-select"
            title="Role"
            value={form.role_id}
            onChange={(event) => setForm((current) => ({ ...current, role_id: Number(event.target.value) || "" }))}
          >
            <option value="">Unassigned</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Password">
          <input
            className="form-input"
            title="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            className="form-input"
            title="Confirm password"
            type="password"
            value={form.password_confirm}
            onChange={(event) =>
              setForm((current) => ({ ...current, password_confirm: event.target.value }))
            }
          />
        </FormField>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
          />
          Active
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={form.is_staff}
            onChange={(event) => setForm((current) => ({ ...current, is_staff: event.target.checked }))}
          />
          Admin (staff)
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={form.must_change_password}
            onChange={(event) =>
              setForm((current) => ({ ...current, must_change_password: event.target.checked }))
            }
          />
          Must change password
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Badge size="md" variant="neutral">
          Please choose a secure password before creating or updating a user.
        </Badge>
        <div className="flex gap-2">
          {editing && onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : null}
          <Button disabled={submitting} onClick={onSubmit} type="button">
            {submitting ? "Saving..." : editing ? "Update user" : "Create user"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
