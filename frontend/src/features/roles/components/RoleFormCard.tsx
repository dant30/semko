import type { Dispatch, ReactNode, SetStateAction } from "react";

import { permissions as allPermissionCodes } from "@/core/constants/permissions";
import type { RoleFormValues } from "@/features/roles/types/role";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function normalizePermissionCode(key: string) {
  return key
    .toString()
    .split(".")
    .map((segment, index) => {
      if (index === 0) return segment.charAt(0).toUpperCase() + segment.slice(1);
      return segment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .join(" — ");
}

function parsePermissions(value: string) {
  return value
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function formatPermissions(values: string[]) {
  return values.join(", ");
}

const permissionDescriptions: Record<string, string> = {
  "users.view_user": "Can view user list and profile info.",
  "users.manage_user": "Can create, edit, and delete user accounts.",
  "users.view_role": "Can inspect role details.",
  "users.manage_role": "Can create/edit/delete roles and assign permissions.",
  "audit.view_log": "Can view audit trail and logs.",
  "vehicles.view_vehicle": "Can inspect vehicle records.",
  "vehicles.manage_vehicle": "Can add and update vehicles.",
  "drivers.view_driver": "Can view driver profiles.",
  "drivers.manage_driver": "Can manage driver assignments and info.",
  "trips.view_trip": "Can view trip records.",
  "trips.manage_trip": "Can create and approve trips.",
  "stores.view_store": "Can view store inventory and status.",
  "stores.manage_store": "Can manage store operations.",
  "fuel.view_fuel": "Can view fuel usage reports.",
  "fuel.manage_fuel": "Can manage refueling approvals.",
  "maintenance.view_maintenance": "Can view maintenance requests.",
  "maintenance.manage_maintenance": "Can trigger and close maintenance jobs.",
  "payroll.view_payroll": "Can view payroll summaries.",
  "payroll.manage_payroll": "Can enforce payroll adjustments.",
};

const permissionPresets: Record<string, string[]> = {
  "Full access": Object.values(allPermissionCodes),
  Manager: [
    allPermissionCodes.viewUsers,
    allPermissionCodes.manageUsers,
    allPermissionCodes.viewRoles,
    allPermissionCodes.manageRoles,
    allPermissionCodes.viewTrips,
    allPermissionCodes.manageTrips,
    allPermissionCodes.viewVehicles,
    allPermissionCodes.manageVehicles,
  ].filter(Boolean),
  "Read-only": Object.values(allPermissionCodes).filter((p) => p.includes("view")),
};

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

export function RoleFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
  editing,
  onCancel,
}: {
  form: RoleFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<RoleFormValues>>;
  submitting: boolean;
  editing?: boolean;
  onCancel?: () => void;
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>{editing ? "Edit role" : "Create role"}</h3>
        <p className="mt-2 text-sm">Manage role metadata and permissions in the authorization system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name">
          <input
            className="form-input"
            title="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </FormField>
        <FormField label="Code">
          <input
            className="form-input"
            title="Code"
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
          />
        </FormField>
        <FormField label="Description">
          <input
            className="form-input"
            title="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </FormField>
        <FormField label="Permissions (choose from list or comma-separated)">
          <div className="mb-2 flex flex-wrap gap-2">
            {Object.entries(permissionPresets).map(([preset, value]) => (
              <Button
                key={preset}
                size="sm"
                variant="secondary"
                onClick={() => setForm((current) => ({ ...current, permissions: formatPermissions(value) }))}
                type="button"
              >
                {preset}
              </Button>
            ))}
          </div>

          <div className="max-h-52 overflow-auto rounded-xl border border-surface-border p-3">
            {Object.values(allPermissionCodes).map((permission) => {
              const checked = parsePermissions(form.permissions).includes(permission);
              return (
                <label key={permission} className="mb-2 flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const selected = parsePermissions(form.permissions);
                      const next = event.target.checked
                        ? Array.from(new Set([...selected, permission]))
                        : selected.filter((p) => p !== permission);
                      setForm((current) => ({ ...current, permissions: formatPermissions(next) }));
                    }}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="font-medium">{normalizePermissionCode(permission)}</div>
                    <div className="text-xs text-app-secondary">{permissionDescriptions[permission]}</div>
                    <div className="text-xs text-app-info">{permission}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <input
            className="form-input mt-3"
            title="Permissions comma-separated"
            value={form.permissions}
            onChange={(event) => setForm((current) => ({ ...current, permissions: event.target.value }))}
            placeholder="users.view_user, users.manage_user"
          />
        </FormField>
      </div>

      <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Badge size="md" variant="neutral">
          Use permission strings like users.view_user, users.manage_user, etc.
        </Badge>
        <div className="flex gap-2">
          {editing && onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : null}
          <Button disabled={submitting} onClick={onSubmit} type="button">
            {submitting ? "Saving..." : editing ? "Update role" : "Create role"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
