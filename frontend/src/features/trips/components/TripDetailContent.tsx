import {
  CalendarDays,
  CircleDollarSign,
  FileCheck2,
  MapPinned,
  Route,
  Scale,
  Truck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { TripWorkflowActions } from "@/features/trips/components/TripWorkflowActions";
import type { TripRecord, TripSummaryRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Badge, Button, Card, EmptyBlock, Skeleton } from "@/shared/components/ui";

interface TripDetailContentProps {
  actionInFlight?: TripWorkflowAction | null;
  canManageTrips?: boolean;
  isLoading?: boolean;
  onAction: (action: TripWorkflowAction) => void;
  onOpenFullPage?: () => void;
  trip: TripRecord | null;
  tripSummary: TripSummaryRecord | null;
  workflowError?: string;
}

function formatCurrency(value?: string) {
  return new Intl.NumberFormat("en-KE", {
    currency: "KES",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number.parseFloat(value || "0") || 0);
}

export function TripDetailContent({
  actionInFlight = null,
  canManageTrips = false,
  isLoading = false,
  onAction,
  onOpenFullPage,
  trip,
  tripSummary,
  workflowError,
}: TripDetailContentProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (!trip || !tripSummary) {
    return (
      <EmptyBlock
        description="Select a trip in the register to load its detail view."
        title="No trip detail available"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">Trip Workflow</Badge>
          <p className="text-sm text-app-secondary">
            Delivery note {trip.delivery_note_number} for {trip.destination}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenFullPage ? (
            <Button onClick={onOpenFullPage} size="sm" type="button" variant="ghost">
              Open full page
            </Button>
          ) : null}
          {canManageTrips ? (
            <Button
              onClick={() => navigate(appRoutes.tripEdit(trip.id))}
              size="sm"
              type="button"
              variant="secondary"
            >
              Edit trip
            </Button>
          ) : null}
        </div>
      </div>

      <TripWorkflowActions
        actionInFlight={actionInFlight}
        canManageTrips={canManageTrips}
        onAction={onAction}
        trip={trip}
      />

      {workflowError ? (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
            {workflowError}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TripMeta
          icon={<CalendarDays className="h-4 w-4 text-brand-600" />}
          label="Trip date"
          value={trip.trip_date}
        />
        <TripMeta
          icon={<Route className="h-4 w-4 text-accent-600" />}
          label="Status"
          value={trip.status.replace(/_/g, " ")}
        />
        <TripMeta
          icon={<Truck className="h-4 w-4 text-brand-600" />}
          label="Trip type"
          value={trip.trip_type}
        />
        <TripMeta
          icon={<FileCheck2 className="h-4 w-4 text-accent-600" />}
          label="Documents"
          value={trip.documents_verified ? "Verified" : "Pending verification"}
        />
        <TripMeta
          icon={<MapPinned className="h-4 w-4 text-brand-600" />}
          label="Destination"
          value={trip.destination}
        />
        <TripMeta
          icon={<UserRound className="h-4 w-4 text-accent-600" />}
          label="Classification"
          value={trip.classification_label || "Unclassified"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OperationalCard
          label="Expected quantity"
          value={`${trip.expected_quantity} ${trip.quantity_unit || ""}`.trim()}
        />
        <OperationalCard
          label="Net weight"
          value={tripSummary.net_weight || trip.weighbridge_reading?.site_net_weight || "N/A"}
        />
        <OperationalCard
          label="Agreed price"
          value={formatCurrency(trip.agreed_unit_price)}
        />
        <OperationalCard
          label="Penalty"
          value={formatCurrency(tripSummary.penalty_amount || trip.discrepancy?.penalty_amount)}
        />
        <OperationalCard
          label="Cess"
          value={formatCurrency(tripSummary.cess_amount || trip.cess_transaction?.amount)}
        />
        <OperationalCard
          label="Hired settlement"
          value={trip.hired_trip?.settlement_status || "Not applicable"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[1.75rem] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Scale className="h-4 w-4 text-brand-600" />
            <h4>Weighbridge</h4>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow
              label="Quarry gross / tare"
              value={`${trip.weighbridge_reading?.quarry_gross_weight || "N/A"} / ${trip.weighbridge_reading?.quarry_tare_weight || "N/A"}`}
            />
            <DetailRow
              label="Site gross / tare"
              value={`${trip.weighbridge_reading?.site_gross_weight || "N/A"} / ${trip.weighbridge_reading?.site_tare_weight || "N/A"}`}
            />
            <DetailRow
              label="Difference"
              value={trip.discrepancy?.weight_difference || "Not yet calculated"}
            />
          </dl>
        </Card>

        <Card className="rounded-[1.75rem] p-5">
          <div className="mb-3 flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-accent-600" />
            <h4>Operational notes</h4>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow label="Remarks" value={trip.remarks || "No trip remarks captured yet."} />
            <DetailRow
              label="Discrepancy notes"
              value={trip.discrepancy?.notes || "No discrepancy notes."}
            />
            <DetailRow
              label="Cess notes"
              value={trip.cess_transaction?.notes || "No cess notes."}
            />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function TripMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/80">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold capitalize text-app-primary">{value}</p>
    </div>
  );
}

function OperationalCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[1.5rem] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-app-primary">{value}</p>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white/70 px-4 py-3 dark:bg-slate-900/70">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-app-primary">{value}</dd>
    </div>
  );
}
