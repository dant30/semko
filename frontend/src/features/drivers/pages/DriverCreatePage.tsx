import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { DriverFormCard } from "@/features/drivers/components";
import { useDriverForm } from "@/features/drivers/hooks/useDriverForm";
import { Badge } from "@/shared/components/ui/Badge";

export function DriverCreatePage() {
  const navigate = useNavigate();
  const { confirmDiscardChanges, error, formValues, isLoading, isSubmitting, submit, updateField } = useDriverForm();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="accent">New driver</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Create driver profile</h1>
            <p className="mt-3 max-w-3xl text-sm text-app-secondary">
              Add a new driver and license record with a dedicated form so you can keep personnel data clean.
            </p>
          </div>
          <div className="flex items-center gap-2 text-app-secondary">
            <Plus className="h-5 w-5" />
            <span>Create driver</span>
          </div>
        </div>
      </section>

      <DriverFormCard
        error={error}
        form={formValues}
        isLoading={isLoading}
        submitting={isSubmitting}
        mode="create"
        onCancel={() => {
          if (confirmDiscardChanges()) {
            navigate(appRoutes.drivers);
          }
        }}
        onSubmit={() => {
          void submit();
        }}
        updateField={updateField}
      />
    </div>
  );
}
