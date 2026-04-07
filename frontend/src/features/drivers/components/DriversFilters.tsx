import { SearchInput, Select, Switch, Button } from "@/shared/components/ui";

import type {
  DriverEmploymentStatus,
  DriverLicenseStatus,
  DriversFilters,
} from "@/features/drivers/types/driver";

const employmentStatusOptions = [
  { value: "", label: "Any employment status" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

const licenseStatusOptions = [
  { value: "", label: "Any license state" },
  { value: "valid", label: "Valid" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
  { value: "revoked", label: "Revoked" },
];

interface DriversFiltersProps {
  filters: DriversFilters;
  onChange: (changes: Partial<DriversFilters>) => void;
  onReset: () => void;
}

export function DriversFilters({ filters, onChange, onReset }: DriversFiltersProps) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Driver filters</p>
          <p className="mt-1 text-sm text-app-secondary">
            Refine the driver register by name, status or license compliance.
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
          placeholder="Search drivers..."
          aria-label="Search drivers"
        />

        <Select
          value={filters.employmentStatus}
          onChange={(event) => onChange({ employmentStatus: event.target.value as DriverEmploymentStatus })}
          options={employmentStatusOptions}
          aria-label="Filter by employment status"
        />

        <Select
          value={filters.licenseStatus}
          onChange={(event) => onChange({ licenseStatus: event.target.value as DriverLicenseStatus })}
          options={licenseStatusOptions}
          aria-label="Filter by license status"
        />

        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium">Active only</p>
            <p className="text-xs text-app-secondary">Only show active driver profiles.</p>
          </div>
          <Switch
            checked={filters.activeOnly}
            onChange={(event) => onChange({ activeOnly: event.target.checked })}
            aria-label="Only show active drivers"
          />
        </div>
      </div>
    </section>
  );
}
