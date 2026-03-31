import { Download } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import type { PayrollPeriodSummaryPayload } from "@/features/reports/types/report";

type PayrollPeriodSummaryProps = {
  summary: PayrollPeriodSummaryPayload | null;
  isExporting: boolean;
  onExport: () => void;
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function PayrollPeriodSummary({ summary, isExporting, onExport }: PayrollPeriodSummaryProps) {
  if (!summary) {
    return (
      <Card className="rounded-3xl border border-app-border p-6">
        <h2 className="text-lg font-semibold text-app-primary">Report summary</h2>
        <p className="mt-3 text-sm text-app-muted">
          Select a payroll period to load the summary report details.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-app-border p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-app-primary">{summary.payroll_period}</h2>
          <p className="mt-1 text-sm text-app-muted">Status: {summary.status}</p>
        </div>
        <Button onClick={onExport} type="button" isLoading={isExporting} leftIcon={<Download className="h-4 w-4" />}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Driver coverage</p>
          <p className="mt-3 text-3xl font-semibold text-app-primary">{summary.driver_count}</p>
          <p className="mt-2 text-sm text-app-muted">Drivers included in this payroll period.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Delivery volume</p>
          <p className="mt-3 text-3xl font-semibold text-app-primary">{summary.delivered_trip_count}</p>
          <p className="mt-2 text-sm text-app-muted">Delivered trips across selected payroll period.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Verified trips</p>
          <p className="mt-3 text-3xl font-semibold text-app-primary">{summary.verified_trip_count}</p>
          <p className="mt-2 text-sm text-app-muted">Verified trip count for payout calculation.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Net payout</p>
          <p className="mt-3 text-3xl font-semibold text-app-primary">{formatCurrency(summary.net_trip_pay)}</p>
          <p className="mt-2 text-sm text-app-muted">Total net pay across all payslips.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-app-primary">Earnings and deductions</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Gross trip revenue</p>
            <p className="mt-2 text-lg font-semibold text-app-secondary">{formatCurrency(summary.gross_trip_revenue)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Gross bonus earnings</p>
            <p className="mt-2 text-lg font-semibold text-app-secondary">{formatCurrency(summary.gross_bonus_earnings)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Gross non-trip earnings</p>
            <p className="mt-2 text-lg font-semibold text-app-secondary">{formatCurrency(summary.gross_non_trip_earnings)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Gross policy earnings</p>
            <p className="mt-2 text-lg font-semibold text-app-secondary">{formatCurrency(summary.gross_policy_earnings)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
