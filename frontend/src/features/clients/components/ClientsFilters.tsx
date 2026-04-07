import { SearchInput, Select, Switch, Button } from "@/shared/components/ui";
import type { ClientFilters } from "@/features/clients/types/client";

const clientTypeOptions = [
  { value: "", label: "All client types" },
  { value: "corporate", label: "Corporate" },
  { value: "individual", label: "Individual" },
];

const statusOptions = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

interface ClientsFiltersProps {
  filters: ClientFilters;
  onChange: (changes: Partial<ClientFilters>) => void;
  onReset: () => void;
}

export function ClientsFilters({ filters, onChange, onReset }: ClientsFiltersProps) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Client filters</p>
          <p className="mt-1 text-sm text-app-secondary">
            Filter client records by name, type, status or active state.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset filters
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SearchInput
          className="sm:col-span-2"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search clients..."
          aria-label="Search clients"
        />

        <Select
          value={filters.clientType}
          onChange={(event) => onChange({ clientType: event.target.value as ClientFilters["clientType"] })}
          options={clientTypeOptions}
          aria-label="All client types"
        />

        <Select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as ClientFilters["status"] })}
          options={statusOptions}
          aria-label="Any status"
        />

        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium">Active only</p>
            <p className="text-xs text-app-secondary">Show only live client records.</p>
          </div>
          <Switch
            checked={filters.activeOnly}
            onChange={(event) => onChange({ activeOnly: event.target.checked })}
            aria-label="Show only live client records"
          />
        </div>
      </div>
    </section>
  );
}
