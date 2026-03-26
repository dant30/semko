import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { tripsApi } from "@/features/trips/services/trips.api";
import { setSelectedTripId, setTripFilters } from "@/features/trips/store/trips.slice";
import type {
  TripFilters,
  TripRecord,
  TripSummaryRecord,
  TripWorkflowAction,
  TripsOperationsSummary,
} from "@/features/trips/types/trip";

const EMPTY_SUMMARY: TripsOperationsSummary = {
  total_trips: 0,
  delivered_trips: 0,
  in_progress_trips: 0,
  cancelled_trips: 0,
  documents_verified: 0,
  total_expected_quantity: "0.00",
  total_cess_amount: "0.00",
  total_penalty_amount: "0.00",
};

export function useTripsOverview() {
  const dispatch = useAppDispatch();
  const { showToast } = useNotifications();
  const filters = useAppSelector((state) => state.trips.filters);
  const selectedTripId = useAppSelector((state) => state.trips.selectedTripId);
  const deferredSearch = useDeferredValue(filters.search);

  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [operationsSummary, setOperationsSummary] =
    useState<TripsOperationsSummary>(EMPTY_SUMMARY);
  const [selectedTripDetail, setSelectedTripDetail] = useState<TripRecord | null>(null);
  const [selectedTripSummary, setSelectedTripSummary] =
    useState<TripSummaryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTripSummary, setIsLoadingTripSummary] = useState(false);
  const [isLoadingTripDetail, setIsLoadingTripDetail] = useState(false);
  const [workflowActionInFlight, setWorkflowActionInFlight] =
    useState<TripWorkflowAction | null>(null);
  const [workflowTripId, setWorkflowTripId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [workflowError, setWorkflowError] = useState("");

  const requestFilters = useMemo<TripFilters>(
    () => ({
      ...filters,
      search: deferredSearch,
    }),
    [deferredSearch, filters]
  );

  useEffect(() => {
    let active = true;
    setIsLoadingTrips(true);
    setError("");

    tripsApi
      .fetchTrips(requestFilters)
      .then((items) => {
        if (!active) {
          return;
        }

        setTrips(items);

        if (items.length === 0) {
          dispatch(setSelectedTripId(null));
          setSelectedTripSummary(null);
          return;
        }

        const selectedStillExists = items.some((item) => item.id === selectedTripId);
        if (!selectedStillExists) {
          dispatch(setSelectedTripId(items[0].id));
        }
      })
      .catch(() => {
        if (active) {
          setTrips([]);
          setError("We could not load trips right now.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingTrips(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dispatch, requestFilters, selectedTripId, refreshKey]);

  useEffect(() => {
    let active = true;
    setIsLoadingSummary(true);

    tripsApi
      .fetchOperationsSummary(filters.activeOnly)
      .then((summary) => {
        if (active) {
          setOperationsSummary(summary);
        }
      })
      .catch(() => {
        if (active) {
          setOperationsSummary(EMPTY_SUMMARY);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters.activeOnly, refreshKey]);

  useEffect(() => {
    if (!selectedTripId) {
      setSelectedTripSummary(null);
      setSelectedTripDetail(null);
      return;
    }

    let active = true;
    setIsLoadingTripSummary(true);
    setIsLoadingTripDetail(true);

    Promise.all([
      tripsApi.fetchTripSummary(selectedTripId),
      tripsApi.fetchTripDetail(selectedTripId),
    ])
      .then(([summary, detail]) => {
        if (active) {
          setSelectedTripSummary(summary);
          setSelectedTripDetail(detail);
        }
      })
      .catch(() => {
        if (active) {
          setSelectedTripSummary(null);
          setSelectedTripDetail(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingTripSummary(false);
          setIsLoadingTripDetail(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedTripId, refreshKey]);

  async function runWorkflowAction(action: TripWorkflowAction, tripId = selectedTripId) {
    if (!tripId) {
      return;
    }

    setWorkflowActionInFlight(action);
    setWorkflowTripId(tripId);
    setWorkflowError("");

    try {
      await tripsApi.runWorkflowAction(tripId, action);
      setRefreshKey((current) => current + 1);
      showToast({
        message: getWorkflowActionMessage(action),
        title: "Trip workflow updated",
        tone: "success",
      });
    } catch {
      const message = "We could not update the selected trip workflow right now.";
      setWorkflowError(message);
      showToast({
        message,
        title: "Trip workflow failed",
        tone: "danger",
      });
    } finally {
      setWorkflowActionInFlight(null);
      setWorkflowTripId(null);
    }
  }

  return {
    closeDrawer: () => setIsDrawerOpen(false),
    error,
    filters,
    isDrawerOpen,
    isLoadingTripDetail,
    isLoadingSummary,
    isLoadingTripSummary,
    isLoadingTrips,
    operationsSummary,
    openDrawer: () => setIsDrawerOpen(true),
    refreshOverview: () => setRefreshKey((current) => current + 1),
    runWorkflowAction,
    selectedTripId,
    selectedTripDetail,
    selectedTripSummary,
    setFilters: (payload: Partial<TripFilters>) => dispatch(setTripFilters(payload)),
    selectTrip: (tripId: number) => dispatch(setSelectedTripId(tripId)),
    trips,
    workflowActionInFlight,
    workflowError,
    workflowTripId,
  };
}

function getWorkflowActionMessage(action: TripWorkflowAction) {
  switch (action) {
    case "dispatch":
      return "The trip has been moved into dispatch/in-progress status.";
    case "confirm_delivery":
      return "The trip has been confirmed as delivered.";
    case "verify_documents":
      return "Trip documents have been marked as verified.";
    default:
      return "The trip workflow has been updated.";
  }
}
