import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { MaterialFormCard } from "@/features/materials/components";
import { useMaterialForm } from "@/features/materials/hooks/useMaterialForm";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function MaterialCreatePage() {
  const navigate = useNavigate();
  const { formValues, isSubmitting, error, submit, setForm } = useMaterialForm();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="accent">New material</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-app-primary">Create material profile</h1>
          <p className="mt-2 text-sm text-app-secondary">Add a new material to your inventory catalog before using it in trips and stores.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(appRoutes.materials)}>
          Back to materials
        </Button>
      </div>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/15">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200">{error}</p>
        </Card>
      ) : null}

      <MaterialFormCard
        form={formValues}
        onChange={setForm}
        onSubmit={submit}
        onCancel={() => navigate(appRoutes.materials)}
        submitting={isSubmitting}
      />
    </div>
  );
}
