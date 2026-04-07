import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { MaterialDetailCard } from "@/features/materials/components/MaterialDetailCard";
import { useMaterialDetail } from "@/features/materials/hooks/useMaterialDetail";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function MaterialDetailPage() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const id = Number(materialId);
  const { material, isLoading, error } = useMaterialDetail(Number.isFinite(id) ? id : undefined);

  const pageTitle = useMemo(() => {
    if (!material) return "Material details";
    return material.name;
  }, [material]);

  if (!materialId || Number.isNaN(id)) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-3xl p-6">
          <h1 className="text-xl font-semibold">Invalid material</h1>
          <p className="mt-2 text-sm text-app-secondary">Please select a valid material from the list.</p>
          <Button variant="ghost" onClick={() => navigate(appRoutes.materials)}>
            Back to materials
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="accent">Material details</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-app-primary">{pageTitle}</h1>
          <p className="mt-2 text-sm text-app-secondary">Review material fields and take action from a dedicated material detail page.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(appRoutes.materials)}>
          Back to materials
        </Button>
      </div>

      {isLoading ? (
        <Card className="rounded-3xl p-6">
          <p className="text-app-secondary">Loading material details...</p>
        </Card>
      ) : error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/15">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200">{error}</p>
        </Card>
      ) : material ? (
        <MaterialDetailCard material={material} />
      ) : (
        <Card className="rounded-3xl p-6">
          <p className="text-app-secondary">Material not found.</p>
        </Card>
      )}
    </div>
  );
}
