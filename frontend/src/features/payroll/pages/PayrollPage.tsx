import { RefreshCw, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { usePayrollWorkspace } from "@/features/payroll/hooks/usePayrollWorkspace";
import type { PayrollPeriodCreatePayload } from "@/features/payroll/types/payroll";
import { Button } from "@/shared/components/ui/Button";
import { PageHeading } from "@/shared/components/ui/PageHeading";
import {
  PayrollCreatePeriodPanel,
  PayrollPeriodDetailsPanel,
  PayrollPeriodsTable,
  PayrollSummaryCards,
} from "@/features/payroll/components";

export function PayrollPage() {
  const {
    periods,
    selectedPeriod,
    selectedPeriodId,
    isLoading,
    isSaving,
    isSubmittingAction,
    error,
    refreshPeriods,
    selectPeriod,
    createPayrollPeriod,
    generatePayrollFromTrips,
    approvePayrollPeriod,
    lockPayrollPeriod,
  } = usePayrollWorkspace();

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createForm, setCreateForm] = useState<PayrollPeriodCreatePayload>({
    name: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  async function handleCreatePayrollPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createPayrollPeriod(createForm);
    setCreateForm({ name: "", start_date: "", end_date: "", notes: "" });
    setShowCreatePanel(false);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeading>Payroll</PageHeading>
          <p className="mt-2 text-sm text-app-secondary">
            Manage payroll cycles, period generation, approval, and finalization in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => void refreshPeriods()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh data
          </Button>
          <Button type="button" variant="secondary" onClick={() => setShowCreatePanel((current) => !current)}>
            <Plus className="h-4 w-4" />
            {showCreatePanel ? "Hide form" : "Create payroll period"}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <PayrollSummaryCards
          total={periods.length}
          draft={periods.filter((item) => item.status?.toLowerCase() === "draft").length}
          processing={periods.filter((item) => item.status?.toLowerCase() === "processing").length}
          completed={periods.filter((item) => item.status?.toLowerCase() === "completed").length}
          approved={periods.filter((item) => item.status?.toLowerCase() === "approved").length}
          locked={periods.filter((item) => item.status?.toLowerCase() === "locked").length}
        />

        <PayrollPeriodDetailsPanel
          period={selectedPeriod}
          isActionInFlight={isSubmittingAction}
          onGenerate={() => selectedPeriod && void generatePayrollFromTrips(selectedPeriod.id)}
          onApprove={() => selectedPeriod && void approvePayrollPeriod(selectedPeriod.id)}
          onLock={() => selectedPeriod && void lockPayrollPeriod(selectedPeriod.id)}
        />
      </section>

      {showCreatePanel && (
        <PayrollCreatePeriodPanel
          payload={createForm}
          onSubmit={handleCreatePayrollPeriod}
          onChange={setCreateForm}
          onCancel={() => setShowCreatePanel(false)}
          isSaving={isSaving}
        />
      )}

      <PayrollPeriodsTable
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        error={error}
        isLoading={isLoading}
        onSelect={selectPeriod}
      />
    </div>
  );
}
