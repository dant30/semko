import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useNotifications } from "@/core/contexts/useNotifications";
import { TripDetailContent } from "@/features/trips/components/TripDetailContent";
import { tripsApi } from "@/features/trips/services/trips.api";
import type { TripRecord, TripSummaryRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function TripDetailPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { showToast } = useNotifications();
  const parsedTripId = Number(tripId);
  const user = useAppSelector((state) => state.auth.user);
  const canManageTrips = hasAnyPermission(
    getUserPermissions(user),
    [permissions.manageTrips]
  );

  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [tripSummary, setTripSummary] = useState<TripSummaryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowActionInFlight, setWorkflowActionInFlight] =
    useState<TripWorkflowAction | null>(null);
  const [workflowError, setWorkflowError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(parsedTripId)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    Promise.all([
      tripsApi.fetchTripDetail(parsedTripId),
      tripsApi.fetchTripSummary(parsedTripId),
    ])
      .then(([detail, summary]) => {
        if (!active) {
          return;
        }

        setTrip(detail);
        setTripSummary(summary);
      })
      .catch(() => {
        if (active) {
          setTrip(null);
          setTripSummary(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [parsedTripId]);

  async function runWorkflowAction(action: TripWorkflowAction) {
    if (!Number.isFinite(parsedTripId)) {
      return;
    }

    setWorkflowActionInFlight(action);
    setWorkflowError("");

    try {
      await tripsApi.runWorkflowAction(parsedTripId, action);
      const [detail, summary] = await Promise.all([
        tripsApi.fetchTripDetail(parsedTripId),
        tripsApi.fetchTripSummary(parsedTripId),
      ]);
      setTrip(detail);
      setTripSummary(summary);
      showToast({
        message: "The trip workflow has been updated successfully.",
        title: "Trip updated",
        tone: "success",
      });
    } catch {
      const message = "We could not update this trip workflow right now.";
      setWorkflowError(message);
      showToast({
        message,
        title: "Trip workflow failed",
        tone: "danger",
      });
    } finally {
      setWorkflowActionInFlight(null);
    }
  }

  if (!Number.isFinite(parsedTripId)) {
    return (
      <Card className="rounded-[2rem] p-6">
        <p className="text-sm text-app-secondary">This trip detail route is not valid.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">
            Trip operations
          </p>
          <h1>{trip?.trip_number || "Trip detail"}</h1>
          <p className="text-app-secondary">
            Review the trip lifecycle and execute workflow actions from a dedicated detail page.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(appRoutes.trips)} type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to register
          </Button>
          {trip ? (
            <Button
              onClick={() => navigate(appRoutes.tripEdit(trip.id))}
              type="button"
              variant="secondary"
            >
              Edit trip
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="rounded-[2rem] p-6">
        <TripDetailContent
          actionInFlight={workflowActionInFlight}
          canManageTrips={canManageTrips}
          isLoading={isLoading}
          onAction={runWorkflowAction}
          trip={trip}
          tripSummary={tripSummary}
          workflowError={workflowError}
        />
      </Card>
    </div>
  );
}
