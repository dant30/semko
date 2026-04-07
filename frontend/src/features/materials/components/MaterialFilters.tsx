import type { MaterialFilters } from "@/features/materials/types/material";
import { Button } from "@/shared/components/ui/Button";

const categories: Array<MaterialFilters["category"]> = ["aggregate", "tarmac", "sand", "dust", "other"];
const units: Array<MaterialFilters["unitOfMeasure"]> = ["tonne", "cubic_meter", "trip"];

interface MaterialFiltersProps {
  filters: MaterialFilters;
  onUpdate: (changes: Partial<MaterialFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export function MaterialFilters({ filters, onUpdate, onReset, onRefresh }: MaterialFiltersProps) {
  return (
    <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="grid gap-3 sm:grid-cols-[1.8fr_12rem_12rem_auto] items-center">
        <input
          value={filters.search}
          onChange={(event) => onUpdate({ search: event.target.value })}
          placeholder="Search materials by name, code, description"
          className="form-input min-w-0 w-full"
        />

        <select
          className="form-select min-w-0 w-full"
          value={filters.category}
          onChange={(event) => onUpdate({ category: event.target.value as MaterialFilters["category"] })}
          aria-label="Category filter"
          title="Category filter"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="form-select min-w-0 w-full"
          value={filters.unitOfMeasure}
          onChange={(event) => onUpdate({ unitOfMeasure: event.target.value as MaterialFilters["unitOfMeasure"] })}
          aria-label="Filter by unit of measure"
          title="Filter by unit of measure"
        >
          <option value="">All units</option>
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <label className="inline-flex h-full items-center gap-2 rounded-full border border-surface-border bg-white/70 px-4 py-2 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
          <input
            type="checkbox"
            checked={filters.activeOnly}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
            onChange={(event) => onUpdate({ activeOnly: event.target.checked })}
          />
          Active only
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onRefresh}>
          Refresh
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </section>
  );
}
