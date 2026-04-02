import { AlertTriangle, Edit, MoreVertical, PackageCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import type { StoreItemRecord } from "@/features/stores/types/store";
import { Skeleton } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function StoreItemsTable({
  isLoading = false,
  items,
  onEdit,
  onDelete,
}: {
  isLoading?: boolean;
  items: StoreItemRecord[];
  onEdit?: (item: StoreItemRecord) => void;
  onDelete?: (item: StoreItemRecord) => void;
}) {
  const [actionMenuItemId, setActionMenuItemId] = useState<number | null>(null);

  const toggleActionMenu = (itemId: number) => {
    setActionMenuItemId(actionMenuItemId === itemId ? null : itemId);
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const closeActionMenu = () => {
    setActionMenuItemId(null);
  };

  const handleDelete = async (item: StoreItemRecord) => {
    if (!onDelete) {
      return;
    }

    setDeletingId(item.id);
    try {
      await onDelete(item);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <EmptyState
          description="Create your first store item or widen the current search filter."
          title="No store items available"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Item</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Reorder</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr className="hover:bg-brand-50 dark:hover:bg-slate-800/60" key={item.id}>
                <td className="px-5 py-4 align-top">
                  <p className="text-sm font-semibold text-app-primary">{item.name}</p>
                  <p className="text-xs text-app-muted">{item.code}</p>
                </td>
                <td className="px-5 py-4 align-top text-sm capitalize text-app-secondary">
                  {item.category.replace(/_/g, " ")}
                </td>
                <td className="px-5 py-4 align-top text-sm text-app-secondary">
                  {item.unit_of_measure}
                </td>
                <td className="px-5 py-4 align-top">
                  <p className="text-sm font-semibold text-app-primary">
                    {item.stock_on_hand}
                  </p>
                </td>
                <td className="px-5 py-4 align-top text-sm text-app-secondary">
                  {item.reorder_level}
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="inline-flex items-center gap-2 text-sm">
                    {item.is_below_reorder_level ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-300">Reorder needed</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="h-4 w-4 text-brand-600" />
                        <span className="text-app-primary">Healthy stock</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-right">
                  <div className="relative">
                    <button
                      type="button"
                      className="text-app-muted hover:text-app-primary"
                      onClick={() => toggleActionMenu(item.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {actionMenuItemId === item.id ? (
                      <div className="dropdown right-0 mt-1 w-44">
                        {onEdit ? (
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => {
                              onEdit(item);
                              closeActionMenu();
                            }}
                          >
                            <Edit className="mr-2 inline h-4 w-4" /> Edit
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            className="dropdown-item"
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={async () => {
                              await handleDelete(item);
                              closeActionMenu();
                            }}
                          >
                            {deletingId === item.id ? (
                              "Deleting..."
                            ) : (
                              <>
                                <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
