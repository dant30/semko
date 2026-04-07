import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClientsFilters, ClientsSummaryCards, ClientsTable } from "@/features/clients/components";
import { useClientsWorkspace } from "@/features/clients/hooks";
import { appRoutes } from "@/core/constants/routes";
import { Button } from "@/shared/components/ui";
import { Card } from "@/shared/components/ui/Card";

export function ClientsPage() {
  const navigate = useNavigate();
  const {
    clients,
    error,
    filters,
    isLoading,
    summary,
    refreshClients,
    setFilters,
    resetFilters,
  } = useClientsWorkspace();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Clients workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Client directory</h1>
            <p className="mt-2 max-w-2xl text-sm text-app-secondary">
              Review and filter active client records. Use the controls below to keep the register current.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={refreshClients}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate(appRoutes.clientCreate)}>
              <Plus className="mr-2 h-4 w-4" />
              Add client
            </Button>
          </div>
        </div>
      </section>

      <ClientsSummaryCards
        total={summary.total}
        active={summary.active}
        inactive={summary.inactive}
        corporate={summary.corporate}
        individual={summary.individual}
      />

      <ClientsFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      {error ? (
        <Card className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20">
          {error}
        </Card>
      ) : null}

      <ClientsTable rows={clients} isLoading={isLoading} />
    </div>
  );
}
