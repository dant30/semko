import type { ReactNode } from "react";

import { Card } from "@/shared/components/ui/Card";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

export function RolesTable<T>({
  columns,
  emptyDescription,
  emptyTitle,
  isLoading,
  rows,
}: {
  columns: Array<Column<T>>;
  emptyDescription: string;
  emptyTitle: string;
  isLoading: boolean;
  rows: T[];
}) {
  return (
    <Card className="overflow-hidden rounded-[2rem]">
      <div className="rounded-none border-none shadow-none">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-surface-base">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border-b border-surface-border px-4 py-3 text-left font-semibold text-app-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white dark:bg-slate-950">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`loading-${index}`} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={`${column.key}-${index}`} className="px-4 py-3">
                      <div className="skeleton h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center" colSpan={columns.length}>
                  <h3 className="text-lg">{emptyTitle}</h3>
                  <p className="mt-2 text-sm text-app-secondary">{emptyDescription}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
