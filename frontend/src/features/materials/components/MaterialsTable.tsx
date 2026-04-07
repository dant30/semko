import { Eye, Pencil, Trash2 } from "lucide-react";
import type { MaterialRecord } from "@/features/materials/types/material";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface MaterialsTableProps {
  materials: MaterialRecord[];
  isLoading: boolean;
  onView: (material: MaterialRecord) => void;
  onEdit: (material: MaterialRecord) => void;
  onDelete: (material: MaterialRecord) => void;
}

export function MaterialsTable({ materials, isLoading, onView, onEdit, onDelete }: MaterialsTableProps) {
  if (isLoading) {
    return (
      <Card className="h-64 rounded-3xl p-5">
        <p className="text-app-secondary">Loading materials...</p>
      </Card>
    );
  }

  if (materials.length === 0) {
    return (
      <Card className="rounded-3xl p-6">
        <h3 className="text-lg font-semibold">No materials yet</h3>
        <p className="mt-2 text-sm text-app-secondary">Add material records to use them in trips and stores.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-soft dark:border-slate-800 dark:bg-slate-950/65">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-4 py-3">{material.name}</td>
              <td className="px-4 py-3">{material.code}</td>
              <td className="px-4 py-3">{material.category}</td>
              <td className="px-4 py-3">{material.unit_of_measure}</td>
              <td className="px-4 py-3">
                {material.is_active ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Active</span>
                ) : (
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">Inactive</span>
                )}
              </td>
              <td className="px-4 py-3 flex flex-wrap gap-2">
                <Button type="button" onClick={() => onView(material)} variant="secondary" className="gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button type="button" onClick={() => onEdit(material)} variant="secondary" className="gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button type="button" onClick={() => onDelete(material)} variant="danger" className="gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
