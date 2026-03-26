import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { TripForm } from "@/features/trips/components/TripForm";
import { useTripForm } from "@/features/trips/hooks";
import { Badge } from "@/shared/components/ui/Badge";

export function TripCreatePage() {
  const navigate = useNavigate();
  const {
    confirmDiscardChanges,
    error,
    fieldErrors,
    filteredQuarries,
    formValues,
    isLoading,
    isSubmitting,
    lookups,
    submit,
    updateField,
  } = useTripForm();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">New trip</Badge>
        <h1 className="mt-4">Create trip</h1>
        <p className="mt-3 max-w-3xl text-base md:text-lg">
          Register a new trip with the right vehicle, driver, client, quarry, and material
          references before dispatch begins.
        </p>
      </section>

      <TripForm
        error={error}
        fieldErrors={fieldErrors}
        filteredQuarries={filteredQuarries}
        formValues={formValues}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        lookups={lookups}
        mode="create"
        onCancel={() => {
          if (confirmDiscardChanges()) {
            navigate(appRoutes.trips);
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        updateField={updateField}
      />
    </div>
  );
}
