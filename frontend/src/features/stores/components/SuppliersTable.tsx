import { MoreVertical, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import type { SupplierRecord } from "@/features/stores/types/store";
import { EmptyBlock, Skeleton } from "@/shared/components/ui";

export function SuppliersTable({
  isLoading = false,
  suppliers,
  onEdit,
  onDelete,
}: {
  isLoading?: boolean;
  suppliers: SupplierRecord[];
  onEdit?: (supplier: SupplierRecord) => void;
  onDelete?: (supplier: SupplierRecord) => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <EmptyBlock description="Create your first supplier to use with purchase orders and receivings." title="No suppliers available" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {suppliers.map((supplier) => (
              <Fragment key={supplier.id}>
                <tr className="hover:bg-brand-50 dark:hover:bg-slate-800/60">
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm font-semibold text-app-primary">{supplier.name}</p>
                    <p className="text-xs text-app-muted">{supplier.email || "N/A"}</p>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-app-secondary">{supplier.contact_name || "N/A"}</td>
                  <td className="px-5 py-4 align-top text-sm">
                    <span className={supplier.is_active ? "text-brand-600" : "text-rose-500"}>
                      {supplier.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <div className="relative inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="text-app-muted hover:text-app-primary"
                        onClick={() => setExpandedId(expandedId === supplier.id ? null : supplier.id)}
                        aria-label={expandedId === supplier.id ? "Collapse supplier details" : "Expand supplier details"}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {onEdit && (
                        <button
                          className="btn-ghost"
                          type="button"
                          onClick={() => onEdit(supplier)}
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn-ghost text-rose-500"
                          type="button"
                          onClick={() => onDelete(supplier)}
                        >
                          <Trash2 className="mr-1 inline h-4 w-4" />Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === supplier.id ? (
                  <tr>
                    <td className="px-5 py-2 text-sm text-app-secondary" colSpan={4}>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                        <p><strong>Phone:</strong> {supplier.phone || "N/A"}</p>
                        <p><strong>Address:</strong> {supplier.address || "N/A"}</p>
                        <p><strong>Status:</strong> {supplier.is_active ? "Active" : "Inactive"}</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
