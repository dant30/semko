import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import type { TripFilters } from "../types/trip";

interface TripsFiltersProps {
  filters: TripFilters;
  onChange: (payload: Partial<TripFilters>) => void;
  onReset: () => void;
}

export function TripsFilters({ filters, onChange, onReset }: TripsFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(2,minmax(0,0.55fr))_auto_auto] lg:items-end">
        <label className="form-group">
          <span className="form-label">Search trips</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Trip number, delivery note, destination..."
              type="search"
              value={filters.search}
            />
          </div>
        </label>

        <label className="form-group">
          <span className="form-label">Status</span>
          <select
            className="form-select"
            onChange={(event) =>
              onChange({
                status: event.target.value as TripFilters["status"],
              })
            }
            value={filters.status}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="form-group">
          <span className="form-label">Trip type</span>
          <select
            className="form-select"
            onChange={(event) =>
              onChange({
                tripType: event.target.value as TripFilters["tripType"],
              })
            }
            value={filters.tripType}
          >
            <option value="">All types</option>
            <option value="owned">Owned fleet</option>
            <option value="hired">Hired fleet</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-3 rounded-2xl border border-surface-border bg-white/80 px-4 py-3 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
          <input
            checked={filters.activeOnly}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            onChange={(event) => onChange({ activeOnly: event.target.checked })}
            type="checkbox"
          />
          Active only
        </label>

        <Button onClick={onReset} type="button" variant="ghost">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </section>
  );
}
