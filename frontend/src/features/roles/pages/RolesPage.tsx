import { useState } from "react";
import { Edit, MoreVertical, RefreshCw } from "lucide-react";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import {
  RoleFormCard,
  RolesSummaryCards,
  RolesTable,
} from "@/features/roles/components";
import { useRolesWorkspace } from "@/features/roles/hooks";
import type { RoleRecord } from "@/features/roles/types/role";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function RolesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canManageRoles = hasAnyPermission(getUserPermissions(user), [
    permissions.manageRoles,
  ]);

  const {
    roles,
    error,
    filters,
    isLoading,
    isSubmitting,
    roleForm,
    editingRoleId,
    refreshAll,
    setFilters,
    setRoleForm,
    submitRole,
    startEditRole,
    cancelEditRole,
    deleteRole,
  } = useRolesWorkspace();

  const [actionMenuRoleId, setActionMenuRoleId] = useState<number | null>(null);

  const toggleActionMenu = (roleId: number) => {
    setActionMenuRoleId((current) => (current === roleId ? null : roleId));
  };

  const closeActionMenu = () => setActionMenuRoleId(null);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Role controls</div>
        <RolesSummaryCards isLoading={isLoading} roles={roles} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <input
              className="form-input"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search role name or code"
            />
          </label>
        </div>

        <Button onClick={refreshAll} type="button" variant="ghost">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </section>

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <section className="space-y-6">
        <div className="space-y-4">
          <RolesTable<RoleRecord>
            columns={[
              { key: "name", label: "Name", render: (row) => row.name },
              { key: "code", label: "Code", render: (row) => row.code },
              { key: "description", label: "Description", render: (row) => row.description || "-" },
              { key: "permissions", label: "Permissions", render: (row) => row.permissions.join(", ") },
              {
                key: "actions",
                label: "Actions",
                render: (row) =>
                  canManageRoles ? (
                    <div className="relative">
                      <Button
                        aria-label="Open role action menu"
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => toggleActionMenu(row.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {actionMenuRoleId === row.id ? (
                        <div className="dropdown right-0 mt-1 w-44">
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => {
                              startEditRole(row);
                              closeActionMenu();
                            }}
                          >
                            <Edit className="mr-2 inline h-4 w-4" /> Edit
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => {
                              deleteRole(row.id);
                              closeActionMenu();
                            }}
                          >
                            <span className="text-red-600 dark:text-red-400">Delete</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "-"
                  ),
              }
            ]}
            emptyDescription="Create roles to implement role-based access control."
            emptyTitle="No roles available"
            isLoading={isLoading}
            rows={roles}
          />
        </div>

        {canManageRoles ? (
          <RoleFormCard
            form={roleForm}
            onSubmit={submitRole}
            setForm={setRoleForm}
            submitting={isSubmitting}
            editing={Boolean(editingRoleId)}
            onCancel={cancelEditRole}
          />
        ) : (
          <Card className="rounded-[2rem] p-6">
            <h3>Read-only roles access</h3>
            <p className="mt-2 text-sm text-app-secondary">
              To manage roles you need <code>users.manage_role</code> permission.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
