import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { MaterialFilters, MaterialsSummaryCards, MaterialsTable } from "@/features/materials/components";
import { useMaterialsWorkspace } from "@/features/materials/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function MaterialsPage() {
  const navigate = useNavigate();
  const { materials, isLoading, error, filters, summary, setFilters, resetFilters, refreshMaterials, deleteMaterial } = useMaterialsWorkspace();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Materials management</div>
        <MaterialsSummaryCards summary={summary} isLoading={isLoading} />
      </section>

      <MaterialFilters
        filters={filters}
        onUpdate={setFilters}
        onReset={resetFilters}
        onRefresh={refreshMaterials}
      />

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/15">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200">{error}</p>
        </Card>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-app-secondary">Materials catalog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={refreshMaterials}>
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(appRoutes.materialCreate)}>
            <Plus className="h-4 w-4" /> Add material
          </Button>
        </div>
      </section>

      <MaterialsTable
        materials={materials}
        isLoading={isLoading}
        onView={(material) => navigate(appRoutes.materialDetail(material.id))}
        onEdit={(material) => navigate(appRoutes.materialEdit(material.id))}
        onDelete={(material) => deleteMaterial(material.id)}
      />
    </div>
  );
}

