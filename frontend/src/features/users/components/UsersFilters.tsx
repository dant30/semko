// frontend/src/features/users/components/UsersFilters.tsx
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FormField } from "@/shared/components/forms/FormField";
import type { UserFilters } from "@/features/users/types/user";

interface UsersFiltersProps {
  filters: UserFilters;
  onChange: (payload: Partial<UserFilters>) => void;
  onReset: () => void;
}

export function UsersFilters({ filters, onChange, onReset }: UsersFiltersProps) {
  return (
    <Card className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(1,minmax(0,0.55fr))_auto] lg:items-end">
        <FormField label="Search users">
          <SearchInput
            placeholder="Username, name, email"
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </FormField>

        <Checkbox
          id="users-active-only"
          checked={filters.activeOnly}
          label="Active only"
          onChange={(event) => onChange({ activeOnly: event.target.checked })}
        />

        <Button onClick={onReset} type="button" variant="ghost">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </Card>
  );
}
