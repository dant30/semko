import { Filter, RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  MaintenanceSummaryCards,
  MaintenanceTable,
  MechanicFormCard,
  PartUsedFormCard,
  ScheduleFormCard,
  ServiceRecordFormCard,
} from "@/features/maintenance/components";
import { useMaintenanceWorkspace } from "@/features/maintenance/hooks";
import type {
  MaintenanceScheduleRecord,
  MaintenanceView,
  MechanicRecord,
  PartUsedRecord,
  ServiceRecordRecord,
} from "@/features/maintenance/types/maintenance";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function getViewFromPath(pathname: string): MaintenanceView {
  if (pathname === appRoutes.maintenanceMechanics) return "mechanics";
  if (pathname === appRoutes.maintenanceServiceRecords) return "service-records";
  if (pathname === appRoutes.maintenancePartsUsed) return "parts-used";
  return "schedules";
}

export function MaintenancePage() {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageMaintenance = hasAnyPermission(getUserPermissions(user), [
    permissions.manageMaintenance,
  ]);
  const {
    error,
    filters,
    isLoading,
    lookups,
    mechanicForm,
    mechanics,
    partUsedForm,
    partsUsed,
    refreshAll,
    scheduleForm,
    schedules,
    serviceRecordForm,
    serviceRecords,
    setFilters,
    setMechanicForm,
    setPartUsedForm,
    setScheduleForm,
    setServiceRecordForm,
    setView,
    submittingView,
    submitForView,
    summary,
  } = useMaintenanceWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Maintenance operational stats</div>
        <MaintenanceSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search mechanics, schedules, service records, or parts"
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
          {activeView === "mechanics" ? (
            <MaintenanceTable<MechanicRecord>
              columns={[
                { key: "employee", label: "Employee", render: (row) => `${row.first_name} ${row.last_name}`.trim() },
                { key: "id", label: "Employee ID", render: (row) => row.employee_id },
                { key: "type", label: "Type", render: (row) => row.employment_type },
                { key: "specialization", label: "Specialization", render: (row) => row.specialization || "N/A" },
                { key: "contact", label: "Contact", render: (row) => row.phone_number || row.email || "N/A" },
              ]}
              emptyDescription="Register your first mechanic or service partner to manage maintenance execution."
              emptyTitle="No mechanics available"
              isLoading={isLoading}
              rows={mechanics}
            />
          ) : null}
          {activeView === "schedules" ? (
            <MaintenanceTable<MaintenanceScheduleRecord>
              columns={[
                { key: "ref", label: "Reference", render: (row) => row.reference_no },
                { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle_registration },
                { key: "title", label: "Title", render: (row) => row.title },
                { key: "type", label: "Type", render: (row) => row.maintenance_type },
                {
                  key: "due",
                  label: "Next due",
                  render: (row) => row.next_due_date || row.next_due_odometer || "Pending derivation",
                },
                { key: "status", label: "Status", render: (row) => row.due_state || row.status },
              ]}
              emptyDescription="Create maintenance schedules to track preventive and corrective work."
              emptyTitle="No schedules available"
              isLoading={isLoading}
              rows={schedules}
            />
          ) : null}
          {activeView === "service-records" ? (
            <MaintenanceTable<ServiceRecordRecord>
              columns={[
                { key: "ref", label: "Reference", render: (row) => row.reference_no },
                { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle_registration },
                { key: "mechanic", label: "Mechanic", render: (row) => row.mechanic_name },
                { key: "date", label: "Service date", render: (row) => row.service_date },
                { key: "status", label: "Status", render: (row) => row.status.replace(/_/g, " ") },
                { key: "cost", label: "Total cost", render: (row) => row.total_cost },
              ]}
              emptyDescription="Capture service execution records to track maintenance work and cost."
              emptyTitle="No service records available"
              isLoading={isLoading}
              rows={serviceRecords}
            />
          ) : null}
          {activeView === "parts-used" ? (
            <MaintenanceTable<PartUsedRecord>
              columns={[
                { key: "item", label: "Stores item", render: (row) => row.item_name },
                { key: "service", label: "Service record", render: (row) => String(row.service_record) },
                { key: "qty", label: "Quantity", render: (row) => row.quantity },
                { key: "unit", label: "Unit cost", render: (row) => row.unit_cost },
                { key: "total", label: "Total cost", render: (row) => row.total_cost },
              ]}
              emptyDescription="Record parts consumption against service records to track maintenance spend."
              emptyTitle="No parts usage available"
              isLoading={isLoading}
              rows={partsUsed}
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
              {canManageMaintenance
                ? "Capture mechanics, schedules, service records, and parts usage directly from the current maintenance workflow view."
                : "Your current access is read-only for maintenance. You can review workshop workload and maintenance history here."}
            </p>
          </div>

          {canManageMaintenance && activeView === "mechanics" ? (
            <MechanicFormCard
              form={mechanicForm}
              onSubmit={() => submitForView("mechanics")}
              setForm={setMechanicForm}
              submitting={submittingView === "mechanics"}
            />
          ) : null}
          {canManageMaintenance && activeView === "schedules" ? (
            <ScheduleFormCard
              form={scheduleForm}
              onSubmit={() => submitForView("schedules")}
              setForm={setScheduleForm}
              submitting={submittingView === "schedules"}
              vehicles={lookups.vehicles}
            />
          ) : null}
          {canManageMaintenance && activeView === "service-records" ? (
            <ServiceRecordFormCard
              form={serviceRecordForm}
              mechanics={lookups.mechanics}
              onSubmit={() => submitForView("service-records")}
              schedules={lookups.schedules}
              setForm={setServiceRecordForm}
              submitting={submittingView === "service-records"}
              vehicles={lookups.vehicles}
            />
          ) : null}
          {canManageMaintenance && activeView === "parts-used" ? (
            <PartUsedFormCard
              form={partUsedForm}
              items={lookups.items}
              onSubmit={() => submitForView("parts-used")}
              serviceRecords={lookups.serviceRecords}
              setForm={setPartUsedForm}
              submitting={submittingView === "parts-used"}
            />
          ) : null}
          {!canManageMaintenance ? (
            <Card className="rounded-[2rem] p-6">
              <h3>Read-only maintenance access</h3>
              <p className="mt-2 text-sm text-app-secondary">
                To capture mechanics, schedules, service records, or parts usage, this user needs
                the <code>maintenance.manage_maintenance</code> permission.
              </p>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
