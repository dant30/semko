import { Droplets, Filter, RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import {
  FuelConsumptionFormCard,
  FuelStationFormCard,
  FuelSummaryCards,
  FuelTransactionFormCard,
  FuelTransactionsTable,
  FuelViewTabs,
} from "@/features/fuel/components";
import { useFuelWorkspace } from "@/features/fuel/hooks";
import type {
  FuelConsumptionRecord,
  FuelStationRecord,
  FuelTransactionRecord,
  FuelView,
} from "@/features/fuel/types/fuel";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

function getViewFromPath(pathname: string): FuelView {
  if (pathname === appRoutes.fuelStations) return "stations";
  if (pathname === appRoutes.fuelConsumption) return "consumption";
  return "transactions";
}

export function FuelPage() {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const user = useAppSelector((state) => state.auth.user);
  const canManageFuel = hasAnyPermission(getUserPermissions(user), [
    permissions.manageFuel,
  ]);
  const {
    consumptionForm,
    consumptions,
    error,
    filters,
    isLoading,
    lookups,
    refreshAll,
    setConsumptionForm,
    setFilters,
    setStationForm,
    setTransactionForm,
    setView,
    stationForm,
    stations,
    submittingView,
    submitForView,
    summary,
    transactionForm,
    transactions,
  } = useFuelWorkspace();

  useEffect(() => {
    if (filters.view !== activeView) {
      setView(activeView);
    }
  }, [activeView, filters.view, setView]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Fuel operational stats</div>
        <FuelSummaryCards isLoading={isLoading} summary={summary} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search station name, code, or fuel records"
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
          {activeView === "stations" ? (
            <FuelTransactionsTable<FuelStationRecord>
              columns={[
                { key: "name", label: "Station", render: (row) => row.name },
                { key: "code", label: "Code", render: (row) => row.code },
                { key: "type", label: "Type", render: (row) => row.station_type },
                { key: "location", label: "Location", render: (row) => row.location || "N/A" },
                {
                  key: "contact",
                  label: "Contact",
                  render: (row) => row.contact_person || row.contact_phone || "N/A",
                },
              ]}
              emptyDescription="Create your first station to track internal or external fuel points."
              emptyTitle="No fuel stations available"
              isLoading={isLoading}
              rows={stations}
            />
          ) : null}
          {activeView === "transactions" ? (
            <FuelTransactionsTable<FuelTransactionRecord>
              columns={[
                { key: "ref", label: "Reference", render: (row) => row.reference_no },
                { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle_registration },
                { key: "station", label: "Station", render: (row) => row.station_name },
                { key: "fuel", label: "Fuel", render: (row) => `${row.fuel_type} · ${row.litres} L` },
                { key: "cost", label: "Cost", render: (row) => row.total_cost },
                {
                  key: "link",
                  label: "Trip / Driver",
                  render: (row) => row.trip_number || row.driver_name || "Unlinked",
                },
              ]}
              emptyDescription="Record the first refueling transaction to start fuel tracking."
              emptyTitle="No fuel transactions available"
              isLoading={isLoading}
              rows={transactions}
            />
          ) : null}
          {activeView === "consumption" ? (
            <FuelTransactionsTable<FuelConsumptionRecord>
              columns={[
                { key: "vehicle", label: "Vehicle", render: (row) => row.vehicle_registration },
                { key: "period", label: "Period", render: (row) => `${row.period_start} to ${row.period_end}` },
                { key: "distance", label: "Distance", render: (row) => row.distance_covered },
                { key: "litres", label: "Litres", render: (row) => row.total_litres },
                { key: "efficiency", label: "km/l", render: (row) => row.km_per_litre },
                { key: "burn", label: "L/100km", render: (row) => row.litres_per_100km },
              ]}
              emptyDescription="Create a consumption period to monitor vehicle fuel efficiency."
              emptyTitle="No fuel consumption periods available"
              isLoading={isLoading}
              rows={consumptions}
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
              {canManageFuel
                ? "Capture station, transaction, and consumption records directly from the current fuel workflow view."
                : "Your current access is read-only for fuel. You can review stations, transactions, and efficiency here."}
            </p>
          </div>

          {canManageFuel && activeView === "stations" ? (
            <FuelStationFormCard
              form={stationForm}
              onSubmit={() => submitForView("stations")}
              setForm={setStationForm}
              submitting={submittingView === "stations"}
            />
          ) : null}
          {canManageFuel && activeView === "transactions" ? (
            <FuelTransactionFormCard
              drivers={lookups.drivers}
              form={transactionForm}
              onSubmit={() => submitForView("transactions")}
              setForm={setTransactionForm}
              stations={lookups.stations}
              submitting={submittingView === "transactions"}
              trips={lookups.trips}
              vehicles={lookups.vehicles}
            />
          ) : null}
          {canManageFuel && activeView === "consumption" ? (
            <FuelConsumptionFormCard
              form={consumptionForm}
              onSubmit={() => submitForView("consumption")}
              setForm={setConsumptionForm}
              submitting={submittingView === "consumption"}
              vehicles={lookups.vehicles}
            />
          ) : null}
          {!canManageFuel ? (
            <Card className="rounded-[2rem] p-6">
              <h3>Read-only fuel access</h3>
              <p className="mt-2 text-sm text-app-secondary">
                To capture stations, transactions, or efficiency periods, this user needs the
                <code>fuel.manage_fuel</code> permission.
              </p>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
