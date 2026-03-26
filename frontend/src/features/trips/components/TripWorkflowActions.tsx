import { CheckCheck, FileCheck2, Send } from "lucide-react";

import type { TripRecord, TripSummaryRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Button } from "@/shared/components/ui/Button";

interface TripWorkflowActionsProps {
  actionInFlight?: TripWorkflowAction | null;
  canManageTrips?: boolean;
  onAction: (action: TripWorkflowAction) => void;
  trip: Pick<TripRecord, "documents_verified" | "status"> | Pick<TripSummaryRecord, "documents_verified" | "status">;
}

export function TripWorkflowActions({
  actionInFlight = null,
  canManageTrips = false,
  onAction,
  trip,
}: TripWorkflowActionsProps) {
  if (!canManageTrips) {
    return null;
  }

  const canDispatch = trip.status === "draft";
  const canConfirmDelivery = trip.status === "in_progress";
  const canVerifyDocuments = !trip.documents_verified;

  return (
    <div className="flex flex-wrap gap-2">
      {canDispatch ? (
        <Button
          disabled={actionInFlight !== null}
          onClick={() => onAction("dispatch")}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Send className="h-4 w-4" />
          {actionInFlight === "dispatch" ? "Dispatching..." : "Dispatch trip"}
        </Button>
      ) : null}

      {canConfirmDelivery ? (
        <Button
          disabled={actionInFlight !== null}
          onClick={() => onAction("confirm_delivery")}
          size="sm"
          type="button"
          variant="primary"
        >
          <CheckCheck className="h-4 w-4" />
          {actionInFlight === "confirm_delivery" ? "Confirming..." : "Confirm delivery"}
        </Button>
      ) : null}

      {canVerifyDocuments ? (
        <Button
          disabled={actionInFlight !== null}
          onClick={() => onAction("verify_documents")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <FileCheck2 className="h-4 w-4" />
          {actionInFlight === "verify_documents" ? "Verifying..." : "Verify documents"}
        </Button>
      ) : null}
    </div>
  );
}
