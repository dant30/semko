import { Filter, RefreshCw, Search, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  DriverFormCard,
  DriversSummaryCards,
  DriversTable,
  DriversViewTabs,
} from "@/features/drivers/components";
import { useDriversWorkspace } from "@/features/drivers/hooks";
import type {
  DriverEmploymentStatus,
  DriverLicenseStatus,
  DriverRecord,
  DriverView,
} from "@/features/drivers/types/driver";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function getViewFromPath(pathname: string): DriverView {
  if (pathname === appRoutes.driverLicenses) return "licenses";
  return "register";
}

export function DriversPage() {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageDrivers = hasAnyPermission(getUserPermissions(user), [
    permissions.manageDrivers,
  ]);
  const {
    driverForm,
    drivers,
    error,
    filters,
    isLoading,
    isSubmitting,
    refreshAll,
    setDriverForm,
    setFilters,
    setView,
    submitDriver,
    summary,
  } = useDriversWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Driver operational stats</div>
        <DriversSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search employee ID, name, phone, or national ID"
              value={filters.search}
            />
          </label>
          <label className="inline-flex items-center gap-3 rounded-full border border-surface-border bg-white/70 px-4 py-2 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              checked={filters.activeOnly}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              onChange={(event) => setFilters({ activeOnly: event.target.checked })}
              type="checkbox"
            />
            Active only
          </label>
          <select
            className="form-select min-w-[11rem]"
            title="Employment status filter"
            onChange={(event) =>
              setFilters({ employmentStatus: event.target.value as "" | DriverEmploymentStatus })
            }
            value={filters.employmentStatus}
          >
            <option value="">All employment</option>
            <option value="active">Active</option>
            <option value="on_leave">On leave</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
          <select
            className="form-select min-w-[11rem]"
            title="License status filter"
            onChange={(event) =>
              setFilters({ licenseStatus: event.target.value as "" | DriverLicenseStatus })
            }
            value={filters.licenseStatus}
          >
            <option value="">All license states</option>
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="revoked">Revoked</option>
          </select>
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {activeView === "register" ? (
            <DriversTable<DriverRecord>
              columns={[
                { key: "employee", label: "Employee ID", render: (row) => row.employee_id },
                { key: "name", label: "Driver", render: (row) => row.full_name },
                { key: "phone", label: "Phone", render: (row) => row.phone_number },
                {
                  key: "employment",
                  label: "Employment",
                  render: (row) => row.employment_status.replace(/_/g, " "),
                },
                {
                  key: "license",
                  label: "License no.",
                  render: (row) => row.license?.license_number || "N/A",
                },
                {
                  key: "status",
                  label: "License state",
                  render: (row) => row.license?.status || "No license",
                },
              ]}
              emptyDescription="Create your first driver profile to begin operational driver management."
              emptyTitle="No drivers available"
              isLoading={isLoading}
              rows={drivers}
            />
          ) : null}
          {activeView === "licenses" ? (
            <DriversTable<DriverRecord>
              columns={[
                { key: "driver", label: "Driver", render: (row) => row.full_name },
                {
                  key: "license_no",
                  label: "License number",
                  render: (row) => row.license?.license_number || "N/A",
                },
                {
                  key: "class",
                  label: "Class",
                  render: (row) => row.license?.license_class || "N/A",
                },
                {
                  key: "expiry",
                  label: "Expiry",
                  render: (row) => row.license?.expiry_date || "N/A",
                },
                {
                  key: "state",
                  label: "Status",
                  render: (row) => row.license?.status || "No license",
                },
                {
                  key: "authority",
                  label: "Authority",
                  render: (row) => row.license?.issuing_authority || "N/A",
                },
              ]}
              emptyDescription="Driver license compliance records will appear here once drivers are registered."
              emptyTitle="No driver licenses available"
              isLoading={isLoading}
              rows={drivers}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg">Workflow panel</h3>
            </div>
            <p className="mt-2 text-sm text-app-secondary">
              {canManageDrivers
                ? "Capture driver and license records directly from the current drivers workflow view."
                : "Your current access is read-only for drivers. You can review workforce and license compliance here."}
            </p>
          </div>

          {canManageDrivers ? (
            <DriverFormCard
              form={driverForm}
              onSubmit={submitDriver}
              setForm={setDriverForm}
              submitting={isSubmitting}
            />
          ) : (
            <Card className="rounded-[2rem] p-6">
              <h3>Read-only driver access</h3>
              <p className="mt-2 text-sm text-app-secondary">
                To capture driver profiles and linked licenses, this user needs the
                <code> drivers.manage_driver </code>
                permission.
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
