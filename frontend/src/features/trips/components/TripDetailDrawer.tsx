import { TripDetailContent } from "@/features/trips/components/TripDetailContent";
import type { TripRecord, TripSummaryRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Drawer } from "@/shared/components/ui/Drawer";

interface TripDetailDrawerProps {
  actionInFlight?: TripWorkflowAction | null;
  canManageTrips?: boolean;
  isLoading?: boolean;
  onAction: (action: TripWorkflowAction) => void;
  onClose: () => void;
  onOpenFullPage: () => void;
  open: boolean;
  trip: TripRecord | null;
  tripSummary: TripSummaryRecord | null;
  workflowError?: string;
}

export function TripDetailDrawer({
  actionInFlight = null,
  canManageTrips = false,
  isLoading = false,
  onAction,
  onClose,
  onOpenFullPage,
  open,
  trip,
  tripSummary,
  workflowError,
}: TripDetailDrawerProps) {
  return (
    <Drawer
      description="Inspect the selected trip in depth and execute workflow updates without leaving the register."
      onClose={onClose}
      open={open}
      title={trip?.trip_number || tripSummary?.trip_number || "Trip detail"}
    >
      <TripDetailContent
        actionInFlight={actionInFlight}
        canManageTrips={canManageTrips}
        isLoading={isLoading}
        onAction={onAction}
        onOpenFullPage={onOpenFullPage}
        trip={trip}
        tripSummary={tripSummary}
        workflowError={workflowError}
      />
    </Drawer>
  );
}
