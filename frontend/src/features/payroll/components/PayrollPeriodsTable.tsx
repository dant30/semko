import type { FC } from "react";

import type { PayrollPeriodRecord } from "@/features/payroll/types/payroll";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface PayrollPeriodsTableProps {
  periods: PayrollPeriodRecord[];
  selectedPeriodId: number | null;
  error: string;
  isLoading: boolean;
  onSelect: (periodId: number) => void;
}

function getRowClass(periodId: number, selectedPeriodId: number | null) {
  return periodId === selectedPeriodId ? "border-brand-500 bg-brand-50/70" : "border-surface-border bg-white";
}

export const PayrollPeriodsTable: FC<PayrollPeriodsTableProps> = ({
  periods,
  selectedPeriodId,
  error,
  isLoading,
  onSelect,
}) => {
  return (
    <Card className="rounded-3xl border border-surface-border bg-white p-6 shadow-soft dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Payroll periods</h3>
          <p className="mt-1 text-sm text-app-secondary">
            Review all configured payroll cycles and choose one to manage.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
          {periods.length} items
        </span>
      </div>

      {error ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-3xl border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Payroll period</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-app-secondary">
                  Loading payroll periods...
                </td>
              </tr>
            ) : periods.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-app-secondary">
                  No payroll periods configured yet. Create a new payroll period to get started.
                </td>
              </tr>
            ) : (
              periods.map((period) => (
                <tr key={period.id} className={getRowClass(period.id, selectedPeriodId)}>
                  <td className="px-4 py-4 font-medium text-slate-900">{period.name}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {period.start_date} — {period.end_date}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                      {period.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      size="sm"
                      variant={period.id === selectedPeriodId ? "secondary" : "outline"}
                      type="button"
                      onClick={() => onSelect(period.id)}
                    >
                      {period.id === selectedPeriodId ? "Selected" : "Select"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
