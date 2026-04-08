// frontend/src/features/users/pages/UsersPage.tsx
import { Eye, Edit, MoreVertical, UserMinus, UserPlus, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  UserDetailDrawer,
  UsersFilters,
  UsersSummaryCards,
  UsersTable,
} from "@/features/users/components";
import { useUsersWorkspace } from "@/features/users/hooks";
import type { UserRecord } from "@/features/users/types/user";
import { Button, Dropdown, DropdownItem } from "@/shared/components/ui";
import { Card } from "@/shared/components/ui/Card";

export function UsersPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const canManageUsers = hasAnyPermission(getUserPermissions(user), [
    permissions.manageUsers,
  ]);

  const {
    users,
    error,
    filters,
    isLoading,
    selectedUserDetail,
    isDrawerOpen,
    isLoadingUserDetail,
    summary,
    refreshAll,
    setFilters,
    selectUser,
    closeDrawer,
    startEditUser,
    deactivateUser,
    activateUser,
  } = useUsersWorkspace();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">User access stats</div>
        <UsersSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <UsersFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ search: "", activeOnly: false })}
      />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div>
          <h3 className="text-xl">Active user register</h3>
          <p className="mt-1 text-sm text-app-secondary">
            Manage user accounts, roles, and activation status in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageUsers ? (
            <Button type="button" variant="secondary" onClick={() => navigate(appRoutes.userCreate)}>
              <Plus className="h-4 w-4" />
              Create user
            </Button>
          ) : null}
          <Button onClick={refreshAll} type="button" variant="ghost">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <section className="grid gap-6">
        <div className="space-y-4 overflow-x-auto">
          <UsersTable<UserRecord>
            rowKey={(row) => row.id}
            columns={[
              { key: "username", label: "Username", render: (row) => row.username },
              { key: "name", label: "Name", render: (row) => `${row.first_name} ${row.last_name}`.trim() || "-" },
              { key: "email", label: "Email", render: (row) => row.email },
              { key: "phone", label: "Phone", render: (row) => row.phone_number || "-" },
              { key: "role", label: "Role", render: (row) => row.role?.name || "Unassigned" },
              { key: "status", label: "Status", render: (row) => (row.is_active ? "Active" : "Inactive") },
              { key: "staff", label: "Staff", render: (row) => (row.is_staff ? "Yes" : "No") },
              {
                key: "actions",
                label: "Actions",
                className: "whitespace-nowrap text-right w-[140px]",
                render: (row) =>
                  canManageUsers ? (
                    <Dropdown
                      align="right"
                      trigger={
                        <Button aria-label="Open actions menu" size="sm" type="button" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    >
                      <DropdownItem
                        type="button"
                        onClick={() => {
                          selectUser(row.id);
                        }}
                      >
                        <UserPlus className="mr-2 inline h-4 w-4" /> Select
                      </DropdownItem>
                      <DropdownItem
                        type="button"
                        onClick={() => {
                          navigate(appRoutes.userDetail(row.id));
                        }}
                      >
                        <Eye className="mr-2 inline h-4 w-4" /> View
                      </DropdownItem>
                      <DropdownItem
                        type="button"
                        onClick={() => {
                          startEditUser(row);
                        }}
                      >
                        <Edit className="mr-2 inline h-4 w-4" /> Edit
                      </DropdownItem>
                      <DropdownItem
                        type="button"
                        onClick={() => {
                          if (row.is_active) {
                            deactivateUser(row.id);
                          } else {
                            activateUser(row.id);
                          }
                        }}
                      >
                        {row.is_active ? (
                          <><UserMinus className="mr-2 inline h-4 w-4" /> Deactivate</>
                        ) : (
                          <><UserPlus className="mr-2 inline h-4 w-4" /> Activate</>
                        )}
                      </DropdownItem>
                    </Dropdown>
                  ) : (
                    "-"
                  ),
              }
            ]}
            emptyDescription="Add a user to get started with access-controlled checkpoints."
            emptyTitle="No users available"
            isLoading={isLoading}
            rows={users}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
            <div className="flex items-center gap-2">
              <h3 className="text-lg">User management</h3>
            </div>
            <p className="mt-2 text-sm text-app-secondary">
              Manage user accounts and review roles in the main table. Use the top controls for creating and refreshing.
            </p>
          </div>
        </div>
      </section>

      <UserDetailDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        isLoading={isLoadingUserDetail}
        selectedUser={selectedUserDetail}
        canManageUsers={canManageUsers}
        onEdit={() => {
          if (selectedUserDetail) {
            navigate(appRoutes.userEdit(selectedUserDetail.id));
            closeDrawer();
          }
        }}
        onView={() => {
          if (selectedUserDetail) {
            navigate(appRoutes.userDetail(selectedUserDetail.id));
            closeDrawer();
          }
        }}
      />

    </div>
  );
}
