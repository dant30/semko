import { Lock, Play, ShieldCheck } from "lucide-react";
import type { FC } from "react";

import { formatDate } from "@/core/utils/dates";
import type { PayrollPeriodRecord } from "@/features/payroll/types/payroll";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface PayrollPeriodDetailsPanelProps {
  period: PayrollPeriodRecord | null;
  isActionInFlight: boolean;
  onGenerate: () => void;
  onApprove: () => void;
  onLock: () => void;
}

function getStatusClasses(status?: string) {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-amber-100 text-amber-800";
    case "processing":
      return "bg-sky-100 text-sky-800";
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "locked":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function formatStatus(status?: string) {
  return status ? String(status).replace(/_/g, " ") : "Unknown";
}

export const PayrollPeriodDetailsPanel: FC<PayrollPeriodDetailsPanelProps> = ({
  period,
  isActionInFlight,
  onGenerate,
  onApprove,
  onLock,
}) => {
  const status = period?.status?.toLowerCase();
  const canGenerate = status === "draft";
  const canApprove = status === "completed";
  const canLock = status === "approved";

  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">In-flight details</h3>
          <p className="mt-1 text-sm text-app-secondary">
            Review the selected payroll period and workflow actions.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
            period ? getStatusClasses(period.status) : "bg-slate-100 text-slate-600"
          }`}
        >
          {period ? formatStatus(period.status) : "No selection"}
        </span>
      </div>

      {period ? (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-app-secondary">Period</p>
              <p className="mt-1 text-base font-medium">
                {formatDate(period.start_date)} — {formatDate(period.end_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-app-secondary">Created</p>
              <p className="mt-1 text-base font-medium">
                {period.created_at ? formatDate(period.created_at) : "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-app-secondary">Notes</p>
            <p className="mt-2 rounded-3xl border border-surface-border bg-slate-50 p-4 text-sm text-slate-700">
              {period.notes || "No notes provided."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button type="button" disabled={!canGenerate || isActionInFlight} onClick={onGenerate}>
              <Play className="h-4 w-4" />
              Generate payroll
            </Button>
            <Button
              type="button"
              disabled={!canApprove || isActionInFlight}
              onClick={onApprove}
              variant="secondary"
            >
              <ShieldCheck className="h-4 w-4" />
              Approve
            </Button>
            <Button
              type="button"
              disabled={!canLock || isActionInFlight}
              onClick={onLock}
              variant="ghost"
            >
              <Lock className="h-4 w-4" />
              Lock
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-surface-border p-6 text-sm text-app-secondary">
          No payroll period selected. Use the list below to choose a period.
        </div>
      )}
    </Card>
  );
};
