import { useNavigate, useParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { TripForm } from "@/features/trips/components/TripForm";
import { useTripForm } from "@/features/trips/hooks";
import { Badge } from "@/shared/components/ui/Badge";

export function TripEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const tripId = Number(params.tripId);
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
  } = useTripForm(Number.isNaN(tripId) ? undefined : tripId);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">Trip update</Badge>
        <h1 className="mt-4">Edit trip</h1>
        <p className="mt-3 max-w-3xl text-base md:text-lg">
          Update the operational, commercial, and workflow details for an existing trip.
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
        mode="edit"
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
