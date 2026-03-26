import { Route, SearchCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useAppDispatch } from "@/core/store/hooks";
import {
  TripDetailDrawer,
  TripDetailPanel,
  TripsFilters,
  TripsSummaryCards,
  TripsTable,
} from "@/features/trips/components";
import { useTripsOverview } from "@/features/trips/hooks";
import { resetTripFilters } from "@/features/trips/store/trips.slice";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function TripsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const canManageTrips = hasAnyPermission(
    getUserPermissions(user),
    [permissions.manageTrips]
  );
  const {
    closeDrawer,
    error,
    filters,
    isDrawerOpen,
    isLoadingTripDetail,
    isLoadingSummary,
    isLoadingTripSummary,
    isLoadingTrips,
    openDrawer,
    operationsSummary,
    runWorkflowAction,
    selectedTripId,
    selectedTripDetail,
    selectedTripSummary,
    setFilters,
    selectTrip,
    trips,
    workflowActionInFlight,
    workflowError,
    workflowTripId,
  } = useTripsOverview();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Trips operational stats</div>
        <TripsSummaryCards isLoading={isLoadingSummary} summary={operationsSummary} />
      </section>

      <TripsFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => dispatch(resetTripFilters())}
      />

      {error ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl">Active trip register</h3>
              <p className="mt-1 text-sm text-app-secondary">
                Review delivery-note activity, route status, and document readiness.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => navigate(appRoutes.tripCreate)}
                type="button"
                variant="secondary"
              >
                <Route className="h-4 w-4" />
                Create trip
              </Button>
              <Button disabled type="button" variant="ghost">
                <SearchCheck className="h-4 w-4" />
                Advanced search
              </Button>
            </div>
          </div>

          <TripsTable
            canManageTrips={canManageTrips}
            isLoading={isLoadingTrips}
            onOpenDetail={(tripId) => {
              selectTrip(tripId);
              openDrawer();
            }}
            onSelect={selectTrip}
            onWorkflowAction={(tripId, action) => {
              selectTrip(tripId);
              runWorkflowAction(action, tripId);
            }}
            selectedTripId={selectedTripId}
            trips={trips}
            workflowActionInFlight={{
              action: workflowActionInFlight,
              tripId: workflowTripId,
            }}
          />
        </div>

        <TripDetailPanel
          canManageTrips={canManageTrips}
          isLoading={isLoadingTripSummary}
          onOpenDetail={openDrawer}
          onWorkflowAction={(action) => runWorkflowAction(action, selectedTripId ?? undefined)}
          tripSummary={selectedTripSummary}
          workflowActionInFlight={workflowActionInFlight}
          workflowError={workflowError}
        />
      </section>

      <TripDetailDrawer
        actionInFlight={workflowActionInFlight}
        canManageTrips={canManageTrips}
        isLoading={isLoadingTripDetail || isLoadingTripSummary}
        onAction={(action) => runWorkflowAction(action, selectedTripId ?? undefined)}
        onClose={closeDrawer}
        onOpenFullPage={() => {
          if (selectedTripId) {
            navigate(appRoutes.tripDetail(selectedTripId));
          }
        }}
        open={isDrawerOpen}
        trip={selectedTripDetail}
        tripSummary={selectedTripSummary}
        workflowError={workflowError}
      />
    </div>
  );
}
