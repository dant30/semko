// frontend/src/features/users/components/UsersTable.tsx
import type { ReactNode } from "react";

import { Card } from "@/shared/components/ui/Card";
import { DataTable, type Column as DataColumn } from "@/shared/components/tables";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface UsersTableProps<T extends object> {
  columns: Array<Column<T>>;
  emptyDescription: string;
  emptyTitle: string;
  isLoading: boolean;
  rows: T[];
  rowKey?: (row: T) => string | number;
}

export function UsersTable<T extends object>({
  columns,
  emptyDescription,
  emptyTitle,
  isLoading,
  rows,
  rowKey,
}: UsersTableProps<T>) {
  const tableColumns: DataColumn<T>[] = columns.map((column) => ({
    key: column.key,
    header: column.label,
    accessor: column.render,
  }));

  if (!isLoading && rows.length === 0) {
    return (
      <Card className="overflow-hidden rounded-[2rem]">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="min-h-[240px]"
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[2rem]">
      <DataTable
        data={rows}
        columns={tableColumns}
        keyPrefix="users"
        isLoading={isLoading}
        className="rounded-none border-none shadow-none"
        rowKey={rowKey ? (row) => rowKey(row) : undefined}
      />
    </Card>
  );
}
