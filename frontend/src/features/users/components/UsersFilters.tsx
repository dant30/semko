import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import type { UserFilters } from "@/features/users/types/user";

interface UsersFiltersProps {
  filters: UserFilters;
  onChange: (payload: Partial<UserFilters>) => void;
  onReset: () => void;
}

export function UsersFilters({ filters, onChange, onReset }: UsersFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(1,minmax(0,0.55fr))_auto] lg:items-end">
        <label className="form-group">
          <span className="form-label">Search users</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <input
              className="form-input pl-10"
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Username, name, email"
              type="search"
              value={filters.search}
            />
          </div>
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
