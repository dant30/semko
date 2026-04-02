import { CircleDollarSign, ExternalLink, FileCheck2, Scale, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { TripWorkflowActions } from "@/features/trips/components/TripWorkflowActions";
import type { TripSummaryRecord, TripWorkflowAction } from "@/features/trips/types/trip";
import { Badge, Button, Card, Skeleton } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

interface TripDetailPanelProps {
  canManageTrips?: boolean;
  isLoading?: boolean;
  onOpenDetail?: () => void;
  onWorkflowAction?: (action: TripWorkflowAction) => void;
  tripSummary: TripSummaryRecord | null;
  workflowActionInFlight?: TripWorkflowAction | null;
  workflowError?: string;
}

function formatCurrency(value: string) {
  const numericValue = Number.parseFloat(value || "0");
  return new Intl.NumberFormat("en-KE", {
    currency: "KES",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}

export function TripDetailPanel({
  canManageTrips = false,
  isLoading = false,
  onOpenDetail,
  onWorkflowAction,
  tripSummary,
  workflowActionInFlight = null,
  workflowError,
}: TripDetailPanelProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="rounded-[2rem] p-6">
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </Card>
    );
  }

  if (!tripSummary) {
    return (
      <Card className="rounded-[2rem] p-6">
        <EmptyState
          description="Select a trip from the table to inspect the operational summary."
          title="No trip selected"
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge variant="accent">Trip Summary</Badge>
          <div>
            <h3>{tripSummary.trip_number}</h3>
            <p className="mt-1 text-sm">{tripSummary.destination}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => onOpenDetail?.()}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ExternalLink className="h-4 w-4" />
              Open detail
            </Button>
            {canManageTrips ? (
              <Button
                onClick={() => navigate(appRoutes.tripEdit(tripSummary.id))}
                size="sm"
                type="button"
                variant="secondary"
              >
                Edit trip
              </Button>
            ) : null}
          </div>
        </div>

        {onWorkflowAction ? (
          <TripWorkflowActions
            actionInFlight={workflowActionInFlight}
            canManageTrips={canManageTrips}
            onAction={onWorkflowAction}
            trip={tripSummary}
          />
        ) : null}

        {workflowError ? (
          <Card className="rounded-3xl border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{workflowError}</p>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
              Status
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-app-primary">
              {tripSummary.status.replace(/_/g, " ")}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
              Classification
            </p>
            <p className="mt-2 text-sm font-semibold text-app-primary">
              {tripSummary.classification_label || "Not classified"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
              Fleet type
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-app-primary">
              {tripSummary.trip_type}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
              Documents
            </p>
            <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-app-primary">
              <FileCheck2 className="h-4 w-4 text-brand-600" />
              {tripSummary.documents_verified ? "Verified" : "Pending verification"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4>Operational value</h4>
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-white/70 px-4 py-3 dark:bg-slate-900/70">
              <span className="inline-flex items-center gap-2 text-sm text-app-secondary">
                <Scale className="h-4 w-4 text-brand-600" />
                Net weight
              </span>
              <strong className="text-app-primary">{tripSummary.net_weight}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-white/70 px-4 py-3 dark:bg-slate-900/70">
              <span className="inline-flex items-center gap-2 text-sm text-app-secondary">
                <CircleDollarSign className="h-4 w-4 text-accent-600" />
                Cess amount
              </span>
              <strong className="text-app-primary">
                {formatCurrency(tripSummary.cess_amount)}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-white/70 px-4 py-3 dark:bg-slate-900/70">
              <span className="inline-flex items-center gap-2 text-sm text-app-secondary">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Penalty amount
              </span>
              <strong className="text-app-primary">
                {formatCurrency(tripSummary.penalty_amount)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
