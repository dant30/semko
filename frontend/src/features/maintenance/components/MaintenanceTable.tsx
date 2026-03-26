import { EmptyBlock, Skeleton } from "@/shared/components/ui";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => string;
}

export function MaintenanceTable<T extends { id: number }>({
  columns,
  emptyDescription,
  emptyTitle,
  isLoading = false,
  rows,
}: {
  columns: Column<T>[];
  emptyDescription: string;
  emptyTitle: string;
  isLoading?: boolean;
  rows: T[];
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <EmptyBlock description={emptyDescription} title={emptyTitle} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60">
            <tr>
              {columns.map((column) => (
                <th
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-app-muted"
                  key={column.key}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr className="hover:bg-brand-50 dark:hover:bg-slate-800/60" key={row.id}>
                {columns.map((column) => (
                  <td className="px-5 py-4 align-top text-sm text-app-secondary" key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
