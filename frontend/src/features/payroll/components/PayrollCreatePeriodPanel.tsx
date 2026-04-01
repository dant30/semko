import type { FC, FormEvent } from "react";

import type { PayrollPeriodCreatePayload } from "@/features/payroll/types/payroll";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";

interface PayrollCreatePeriodPanelProps {
  payload: PayrollPeriodCreatePayload;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (payload: PayrollPeriodCreatePayload) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const PayrollCreatePeriodPanel: FC<PayrollCreatePeriodPanelProps> = ({
  payload,
  onSubmit,
  onChange,
  onCancel,
  isSaving,
}) => {
  const isInvalid = payload.name === "" || payload.start_date === "" || payload.end_date === "";

  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Create payroll period</h3>
          <p className="mt-1 text-sm text-app-secondary">
            Define a new payroll cycle for driver payslip generation.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
          New period
        </span>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <label className="form-group">
          <span className="form-label">Payroll period name</span>
          <Input
            value={payload.name}
            onChange={(event) => onChange({ ...payload, name: event.target.value })}
            placeholder="e.g. March 2026 payroll"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-group">
            <span className="form-label">Start date</span>
            <Input
              type="date"
              value={payload.start_date}
              onChange={(event) => onChange({ ...payload, start_date: event.target.value })}
              required
            />
          </label>
          <label className="form-group">
            <span className="form-label">End date</span>
            <Input
              type="date"
              value={payload.end_date}
              onChange={(event) => onChange({ ...payload, end_date: event.target.value })}
              required
            />
          </label>
        </div>

        <label className="form-group">
          <span className="form-label">Notes (optional)</span>
          <Textarea
            rows={4}
            value={payload.notes ?? ""}
            onChange={(event) => onChange({ ...payload, notes: event.target.value })}
            placeholder="Add any details or approval notes for this period"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSaving || isInvalid}>
            {isSaving ? "Saving..." : "Save payroll period"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
