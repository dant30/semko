import { Filter, RefreshCw, Search, Truck } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  VehicleFleetFormCard,
  VehicleOwnershipFormCard,
  VehicleTypeFormCard,
  VehiclesSummaryCards,
  VehiclesTable,
  VehiclesViewTabs,
} from "@/features/vehicles/components";
import { useVehiclesWorkspace } from "@/features/vehicles/hooks";
import type {
  VehicleOwnershipRecord,
  VehicleRecord,
  VehicleStatus,
  VehicleTypeRecord,
  VehicleView,
} from "@/features/vehicles/types/vehicle";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function getViewFromPath(pathname: string): VehicleView {
  if (pathname === appRoutes.vehicleTypes) return "types";
  if (pathname === appRoutes.vehicleOwnerships) return "ownerships";
  return "fleet";
}

export function VehiclesPage() {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageVehicles = hasAnyPermission(getUserPermissions(user), [
    permissions.manageVehicles,
  ]);
  const {
    error,
    filters,
    isLoading,
    lookupOptions,
    ownershipForm,
    ownerships,
    refreshAll,
    setFilters,
    setOwnershipForm,
    setTypeForm,
    setVehicleForm,
    setView,
    submittingView,
    submitForView,
    summary,
    typeForm,
    types,
    vehicleForm,
    vehicles,
  } = useVehiclesWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Fleet operational stats</div>
        <VehiclesSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search registration, fleet number, make, or model"
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
            className="form-select min-w-[10rem]"
            title="Vehicle status filter"
            onChange={(event) => setFilters({ status: event.target.value as "" | VehicleStatus })}
            value={filters.status}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
          <select
            className="form-select min-w-[12rem]"
            title="Ownership type filter"
            onChange={(event) =>
              setFilters({ ownershipType: event.target.value as typeof filters.ownershipType })
            }
            value={filters.ownershipType}
          >
            <option value="">All ownerships</option>
            <option value="company">Company</option>
            <option value="leased">Leased</option>
            <option value="contracted">Contracted</option>
            <option value="hired">Hired</option>
            <option value="other">Other</option>
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
          {activeView === "fleet" ? (
            <VehiclesTable<VehicleRecord>
              columns={[
                {
                  key: "registration",
                  label: "Registration",
                  render: (row) => row.registration_number,
                },
                { key: "fleet", label: "Fleet no.", render: (row) => row.fleet_number },
                {
                  key: "type",
                  label: "Type",
                  render: (row) => row.vehicle_type?.name || "N/A",
                },
                {
                  key: "ownership",
                  label: "Ownership",
                  render: (row) => row.ownership?.name || "N/A",
                },
                {
                  key: "vehicle",
                  label: "Vehicle",
                  render: (row) => `${row.make} ${row.model}`.trim(),
                },
                { key: "status", label: "Status", render: (row) => row.status },
              ]}
              emptyDescription="Create your first vehicle record to start building the transport fleet register."
              emptyTitle="No vehicles available"
              isLoading={isLoading}
              rows={vehicles}
            />
          ) : null}
          {activeView === "types" ? (
            <VehiclesTable<VehicleTypeRecord>
              columns={[
                { key: "name", label: "Name", render: (row) => row.name },
                { key: "code", label: "Code", render: (row) => row.code },
                {
                  key: "capacity",
                  label: "Default capacity",
                  render: (row) => row.default_capacity_tonnes,
                },
                { key: "axles", label: "Axles", render: (row) => String(row.axle_count) },
                {
                  key: "description",
                  label: "Description",
                  render: (row) => row.description || "N/A",
                },
              ]}
              emptyDescription="Create vehicle type definitions to standardize fleet capacity and class metadata."
              emptyTitle="No vehicle types available"
              isLoading={isLoading}
              rows={types}
            />
          ) : null}
          {activeView === "ownerships" ? (
            <VehiclesTable<VehicleOwnershipRecord>
              columns={[
                { key: "name", label: "Name", render: (row) => row.name },
                { key: "type", label: "Type", render: (row) => row.ownership_type },
                {
                  key: "contact",
                  label: "Contact",
                  render: (row) => row.contact_person || "N/A",
                },
                { key: "phone", label: "Phone", render: (row) => row.phone_number || "N/A" },
                {
                  key: "contract",
                  label: "Contract ref",
                  render: (row) => row.contract_reference || "N/A",
                },
              ]}
              emptyDescription="Create ownership records for internal, leased, hired, or contracted fleet assets."
              emptyTitle="No ownership records available"
              isLoading={isLoading}
              rows={ownerships}
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
              {canManageVehicles
                ? "Capture fleet, type, and ownership records directly from the current vehicle workflow view."
                : "Your current access is read-only for vehicles. You can review fleet coverage, classifications, and ownership records here."}
            </p>
          </div>

          {canManageVehicles && activeView === "fleet" ? (
            <VehicleFleetFormCard
              form={vehicleForm}
              onSubmit={() => submitForView("fleet")}
              ownershipOptions={lookupOptions.ownerships}
              setForm={setVehicleForm}
              submitting={submittingView === "fleet"}
              typeOptions={lookupOptions.types}
            />
          ) : null}
          {canManageVehicles && activeView === "types" ? (
            <VehicleTypeFormCard
              form={typeForm}
              onSubmit={() => submitForView("types")}
              setForm={setTypeForm}
              submitting={submittingView === "types"}
            />
          ) : null}
          {canManageVehicles && activeView === "ownerships" ? (
            <VehicleOwnershipFormCard
              form={ownershipForm}
              onSubmit={() => submitForView("ownerships")}
              setForm={setOwnershipForm}
              submitting={submittingView === "ownerships"}
            />
          ) : null}
          {!canManageVehicles ? (
            <Card className="rounded-[2rem] p-6">
              <h3>Read-only vehicle access</h3>
              <p className="mt-2 text-sm text-app-secondary">
                To capture fleet, type, or ownership records, this user needs the
                <code> vehicles.manage_vehicle </code>
                permission.
              </p>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
