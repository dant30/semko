import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import type { MaterialRecord } from "@/features/materials/types/material";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface MaterialDetailCardProps {
  material: MaterialRecord;
}

export function MaterialDetailCard({ material }: MaterialDetailCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Material details</p>
          <h1 className="mt-2 text-2xl font-semibold text-app-primary">{material.name}</h1>
          <p className="mt-2 text-sm text-app-secondary">Code {material.code} · {material.category} · {material.unit_of_measure}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={material.is_active ? "success" : "danger"}>
            {material.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button type="button" onClick={() => navigate(appRoutes.materialEdit(material.id))}>
            Edit
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(appRoutes.materials)}>
            Back
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Description</p>
          <p className="mt-3 text-sm text-app-secondary">{material.description || "No description added."}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Density factor</p>
          <p className="mt-3 text-sm text-app-secondary">{material.density_factor ?? "Not specified"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Created</p>
          <p className="mt-2 text-sm text-app-secondary">{new Date(material.created_at).toLocaleDateString()}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Last updated</p>
          <p className="mt-2 text-sm text-app-secondary">{material.updated_at ? new Date(material.updated_at).toLocaleDateString() : "Not updated yet"}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Unit</p>
          <p className="mt-2 text-sm text-app-secondary">{material.unit_of_measure}</p>
        </div>
      </div>
    </Card>
  );
}
