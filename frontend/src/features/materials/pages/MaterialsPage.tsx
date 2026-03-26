import { Plus } from "lucide-react";
import { MaterialFormCard, MaterialsSummaryCards, MaterialsTable } from "@/features/materials/components";
import { useMaterialsWorkspace } from "@/features/materials/hooks/useMaterialsWorkspace";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function MaterialsPage() {
  const {
    materials,
    materialForm,
    isLoading,
    isSubmitting,
    error,
    filters,
    summary,
    setFilters,
    resetFilters,
    refreshMaterials,
    setSelected,
    setMaterialForm,
    submitMaterial,
    deleteMaterial,
  } = useMaterialsWorkspace();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Materials management</div>
        <MaterialsSummaryCards summary={summary} isLoading={isLoading} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            placeholder="Search materials by name, code, description"
            className="form-input min-w-[20rem]"
          />
          <select
            className="form-select min-w-[12rem]"
            value={filters.category}
            onChange={(event) => setFilters({ category: event.target.value as Partial<typeof filters>["category"] })}
            aria-label="Category filter"
            title="Category filter"
          >
            <option value="">All categories</option>
            <option value="aggregate">Aggregate</option>
            <option value="tarmac">Tarmac</option>
            <option value="sand">Sand</option>
            <option value="dust">Dust</option>
            <option value="other">Other</option>
          </select>
          <select
            className="form-select min-w-[12rem]"
            value={filters.unitOfMeasure}
            onChange={(event) => setFilters({ unitOfMeasure: event.target.value as Partial<typeof filters>["unitOfMeasure"] })}
            aria-label="Filter by unit of measure"
            title="Filter by unit of measure"
          >
            <option value="">All units</option>
            <option value="tonne">Tonne</option>
            <option value="cubic_meter">Cubic Meter</option>
            <option value="trip">Trip</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-white/70 px-4 py-2 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
              onChange={(event) => setFilters({ activeOnly: event.target.checked })}
            />
            Active only
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={refreshMaterials}>Refresh</Button>
          <Button type="button" onClick={() => setSelected(null)}>
            <Plus className="h-4 w-4" /> Add material
          </Button>
          <Button type="button" variant="ghost" onClick={resetFilters}>Reset</Button>
        </div>
      </section>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/15">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200">{error}</p>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <MaterialsTable
          materials={materials}
          isLoading={isLoading}
          onEdit={(material) => setSelected(material.id)}
          onDelete={(material) => deleteMaterial(material.id)}
        />

        <MaterialFormCard
          form={materialForm}
          onChange={setMaterialForm}
          onSubmit={submitMaterial}
          onCancel={() => setSelected(null)}
          submitting={isSubmitting}
        />
      </section>
    </div>
  );
}

