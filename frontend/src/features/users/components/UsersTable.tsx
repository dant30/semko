import type { ReactNode } from "react";

import { Card } from "@/shared/components/ui/Card";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

export function UsersTable<T>({
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
      <div className="table-container rounded-none border-none shadow-none">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {columns.map((column) => (
                    <td key={`${column.key}-${index}`}>
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
