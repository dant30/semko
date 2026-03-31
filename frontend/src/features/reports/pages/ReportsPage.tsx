import { useMemo } from "react";

import { useReportsWorkspace } from "@/features/reports/hooks";
import { PayrollPeriodList, PayrollPeriodSummary } from "@/features/reports/components";
import { Card } from "@/shared/components/ui/Card";

export function ReportsPage() {
  const {
    periods,
    selectedPeriodId,
    summary,
    isLoading,
    isExporting,
    error,
    loadPayrollPeriodSummary,
    exportPayrollPeriodCsv,
  } = useReportsWorkspace();

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.id === selectedPeriodId) ?? null,
    [periods, selectedPeriodId]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold text-app-primary">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm text-app-muted">
            Access payroll summary reports and export completed payroll periods for downstream review.
          </p>
        </div>
      </section>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PayrollPeriodList
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          isLoading={isLoading}
          onSelectPeriod={(id) => void loadPayrollPeriodSummary(id)}
        />

        <div className="space-y-6">
          <PayrollPeriodSummary
            summary={summary}
            isExporting={isExporting}
            onExport={() => {
              if (selectedPeriodId !== null) {
                void exportPayrollPeriodCsv(selectedPeriodId);
              }
            }}
          />

          {selectedPeriod ? (
            <Card className="rounded-3xl border border-app-border p-6">
              <h2 className="text-lg font-semibold text-app-primary">Selected payroll period</h2>
              <div className="mt-4 space-y-3 text-sm text-app-muted">
                <div className="flex items-center justify-between gap-4">
                  <span>Name</span>
                  <strong className="text-app-secondary">{selectedPeriod.name}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Period</span>
                  <strong className="text-app-secondary">
                    {selectedPeriod.start_date} — {selectedPeriod.end_date}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Status</span>
                  <strong className="text-app-secondary">{selectedPeriod.status}</strong>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
