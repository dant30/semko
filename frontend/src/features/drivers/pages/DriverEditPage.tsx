import { useNavigate, useParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { DriverFormCard } from "@/features/drivers/components";
import { useDriverForm } from "@/features/drivers/hooks/useDriverForm";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";

export function DriverEditPage() {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const parsedDriverId = Number(driverId);
  const {
    confirmDiscardChanges,
    error,
    formValues,
    isLoading,
    isSubmitting,
    submit,
    updateField,
  } = useDriverForm(Number.isFinite(parsedDriverId) ? parsedDriverId : undefined);

  if (!Number.isFinite(parsedDriverId)) {
    return (
      <div className="space-y-6">
        <Card className="rounded-[2rem] p-6">
          <p className="text-sm text-app-secondary">This driver edit route is not valid.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">Update driver</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Edit driver details</h1>
        <p className="mt-3 max-w-3xl text-sm text-app-secondary">
          Modify the driver profile and license information in a dedicated page designed for save and review.
        </p>
      </section>

      <DriverFormCard
        error={error}
        form={formValues}
        isLoading={isLoading}
        submitting={isSubmitting}
        mode="edit"
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
