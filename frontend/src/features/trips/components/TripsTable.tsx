import { CheckCheck, FileCheck2, FileWarning, Send, Truck, TruckIcon } from "lucide-react";

import type { TripRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Badge, Button, Skeleton } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { cn } from "@/shared/utils/classnames";

interface TripsTableProps {
  canManageTrips?: boolean;
  isLoading?: boolean;
  onOpenDetail: (tripId: number) => void;
  onSelect: (tripId: number) => void;
  onWorkflowAction: (tripId: number, action: TripWorkflowAction) => void;
  selectedTripId: number | null;
  trips: TripRecord[];
  workflowActionInFlight?: {
    action: TripWorkflowAction | null;
    tripId: number | null;
  };
}

function getStatusTone(status: TripRecord["status"]) {
  switch (status) {
    case "delivered":
      return "brand";
    case "in_progress":
      return "accent";
    case "cancelled":
      return "accent";
    default:
      return "brand";
  }
}

function formatTripStatus(status: TripRecord["status"]) {
  return status.replace(/_/g, " ");
}

export function TripsTable({
  canManageTrips = false,
  isLoading = false,
  onOpenDetail,
  onSelect,
  onWorkflowAction,
  selectedTripId,
  trips,
  workflowActionInFlight,
}: TripsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <EmptyState
          description="Try widening the filters or search by trip number, delivery note, or destination."
          title="No trips match the current filters"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Trip
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Route
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Quantity
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Documents
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trips.map((trip) => {
              const isSelected = trip.id === selectedTripId;
              return (
                <tr
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-brand-50 dark:hover:bg-slate-800/60",
                    isSelected && "bg-brand-50 dark:bg-slate-800"
                  )}
                  key={trip.id}
                  onClick={() => onSelect(trip.id)}
                >
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-app-primary">{trip.trip_number}</p>
                      <p className="text-xs text-app-muted">{trip.delivery_note_number}</p>
                      <p className="text-xs text-app-secondary">{trip.trip_date}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm text-app-primary">{trip.destination}</p>
                      <p className="text-xs text-app-muted">
                        {trip.classification_label || "Unclassified"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="inline-flex items-center gap-2 text-sm text-app-secondary">
                      {trip.trip_type === "hired" ? (
                        <TruckIcon className="h-4 w-4 text-accent-600" />
                      ) : (
                        <Truck className="h-4 w-4 text-brand-600" />
                      )}
                      <span className="capitalize">{trip.trip_type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-app-primary">
                        {trip.expected_quantity}
                      </p>
                      <p className="text-xs text-app-muted">{trip.quantity_unit || "units"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Badge variant={getStatusTone(trip.status)} className="capitalize">
                      {formatTripStatus(trip.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="inline-flex items-center gap-2 text-sm">
                      {trip.documents_verified ? (
                        <>
                          <FileCheck2 className="h-4 w-4 text-brand-600" />
                          <span className="text-app-primary">Verified</span>
                        </>
                      ) : (
                        <>
                          <FileWarning className="h-4 w-4 text-amber-500" />
                          <span className="text-app-secondary">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenDetail(trip.id);
                        }}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Detail
                      </Button>
                      {canManageTrips && trip.status === "draft" ? (
                        <Button
                          disabled={
                            workflowActionInFlight?.tripId === trip.id &&
                            workflowActionInFlight.action !== null
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onWorkflowAction(trip.id, "dispatch");
                          }}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {canManageTrips && trip.status === "in_progress" ? (
                        <Button
                          disabled={
                            workflowActionInFlight?.tripId === trip.id &&
                            workflowActionInFlight.action !== null
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onWorkflowAction(trip.id, "confirm_delivery");
                          }}
                          size="sm"
                          type="button"
                          variant="primary"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {canManageTrips && !trip.documents_verified ? (
                        <Button
                          disabled={
                            workflowActionInFlight?.tripId === trip.id &&
                            workflowActionInFlight.action !== null
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onWorkflowAction(trip.id, "verify_documents");
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <FileCheck2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
