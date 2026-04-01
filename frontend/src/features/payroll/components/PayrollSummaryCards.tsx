import type { FC } from "react";
import { Card } from "@/shared/components/ui/Card";

export interface PayrollSummaryCardsProps {
  total: number;
  draft: number;
  processing: number;
  completed: number;
  approved: number;
  locked: number;
}

export const PayrollSummaryCards: FC<PayrollSummaryCardsProps> = ({
  total,
  draft,
  processing,
  completed,
  approved,
  locked,
}) => {
  const items = [
    { label: "Draft", value: draft },
    { label: "Processing", value: processing },
    { label: "Completed", value: completed },
    { label: "Approved", value: approved },
    { label: "Locked", value: locked },
  ];

  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Period summary</h3>
          <p className="mt-1 text-sm text-app-secondary">
            Current payroll cycles and status counts.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
          {total} total
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-3xl border border-surface-border p-4">
            <p className="text-sm text-app-secondary">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
