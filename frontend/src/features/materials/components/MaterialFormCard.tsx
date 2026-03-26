import type { MaterialFormValues, MaterialCategory, MaterialUnitOfMeasure } from "@/features/materials/types/material";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface MaterialFormCardProps {
  form: MaterialFormValues;
  onChange: (value: MaterialFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const categories: MaterialCategory[] = ["aggregate", "tarmac", "sand", "dust", "other"];
const units: MaterialUnitOfMeasure[] = ["tonne", "cubic_meter", "trip"];

export function MaterialFormCard({ form, onChange, onSubmit, onCancel, submitting }: MaterialFormCardProps) {
  return (
    <Card className="rounded-3xl p-5">
      <h3 className="text-lg font-semibold">{form.name ? "Edit material" : "Add new material"}</h3>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="form-input mt-1 w-full"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            aria-label="Material name"
            placeholder="Enter material name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Code</label>
          <input
            className="form-input mt-1 w-full"
            value={form.code}
            onChange={(e) => onChange({ ...form, code: e.target.value })}
            aria-label="Material code"
            placeholder="Enter material code"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="form-select mt-1 w-full"
              value={form.category}
              onChange={(e) => onChange({ ...form, category: e.target.value as MaterialCategory })}
              aria-label="Material category"
              title="Material category"
            >
              {categories.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Unit</label>
            <select
              className="form-select mt-1 w-full"
              value={form.unit_of_measure}
              onChange={(e) => onChange({ ...form, unit_of_measure: e.target.value as MaterialUnitOfMeasure })}
              aria-label="Material unit of measure"
              title="Material unit of measure"
            >
              {units.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="form-textarea mt-1 w-full"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            aria-label="Material description"
            placeholder="Optional description"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Density factor</label>
            <input
              className="form-input mt-1 w-full"
              type="number"
              step="0.001"
              value={form.density_factor}
              onChange={(e) => onChange({ ...form, density_factor: e.target.value })}
              aria-label="Density factor"
              placeholder="Optional density factor"
            />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={form.is_active}
                onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
