import { Plus, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  DriversFilters,
  DriversSummaryCards,
  DriversTable,
  DriversViewTabs,
} from "@/features/drivers/components";
import { useDriversWorkspace } from "@/features/drivers/hooks";
import type { DriverRecord, DriverView } from "@/features/drivers/types/driver";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function getViewFromPath(pathname: string): DriverView {
  if (pathname === appRoutes.driverLicenses) return "licenses";
  return "register";
}

export function DriversPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageDrivers = hasAnyPermission(getUserPermissions(user), [permissions.manageDrivers]);
  const { drivers, error, filters, isLoading, refreshAll, resetFilters, setFilters, setView, summary } = useDriversWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Driver workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Driver register</h1>
            <p className="mt-2 max-w-2xl text-sm text-app-secondary">
              Review driver records, monitor license compliance, and create new driver profiles from a dedicated workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={refreshAll}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {canManageDrivers ? (
              <Button type="button" onClick={() => navigate(appRoutes.driverCreate)}>
                <Plus className="mr-2 h-4 w-4" />
                Add driver
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <DriversSummaryCards isLoading={isLoading} summary={summary} />

      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <DriversViewTabs activeView={activeView} />
          <Button type="button" variant="ghost" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>

        <DriversFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
      </section>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <DriversTable<DriverRecord>
        columns={
          activeView === "register"
            ? [
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
              ]
            : [
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
              ]
        }
        emptyDescription={
          activeView === "register"
            ? "Create your first driver profile to begin operational driver management."
            : "Driver license compliance records will appear here once drivers are registered."
        }
        emptyTitle={activeView === "register" ? "No drivers available" : "No driver licenses available"}
        isLoading={isLoading}
        rows={drivers}
      />
    </div>
  );
}
