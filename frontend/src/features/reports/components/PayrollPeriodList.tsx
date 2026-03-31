import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import type { PayrollPeriodRecord } from "@/features/reports/types/report";

type PayrollPeriodListProps = {
  periods: PayrollPeriodRecord[];
  selectedPeriodId: number | null;
  isLoading: boolean;
  onSelectPeriod: (reportId: number) => void;
};

export function PayrollPeriodList({
  periods,
  selectedPeriodId,
  isLoading,
  onSelectPeriod,
}: PayrollPeriodListProps) {
  if (isLoading) {
    return (
      <Card className="rounded-3xl border border-app-border p-6">
        <div className="space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        </div>
      </Card>
    );
  }

  if (periods.length === 0) {
    return (
      <Card className="rounded-3xl border border-app-border p-6">
        <h2 className="text-lg font-semibold text-app-primary">Payroll periods</h2>
        <p className="mt-3 text-sm text-app-muted">
          There are no payroll periods available. Create a payroll period in the payroll module first.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-app-border p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-app-primary">Payroll periods</h2>
          <p className="text-sm text-app-muted">Pick a period to preview report summary and export data.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-app-muted">
          {periods.length} records
        </span>
      </div>

      <div className="space-y-3">
        {periods.map((period) => {
          const isSelected = selectedPeriodId === period.id;
          return (
            <div
              key={period.id}
              className={`flex flex-col gap-3 rounded-3xl border p-4 transition ${
                isSelected ? "border-brand-500 bg-brand-50/30" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-app-secondary">{period.name}</div>
                  <p className="mt-1 text-sm text-app-muted">
                    {period.start_date} — {period.end_date}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-app-muted">
                  {period.status}
                </span>
              </div>

              <Button
                onClick={() => onSelectPeriod(period.id)}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isSelected ? "Selected" : "View report"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
