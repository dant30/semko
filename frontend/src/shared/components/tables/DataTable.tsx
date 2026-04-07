// frontend/src/shared/components/tables/DataTable.tsx
import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableHint } from './TableHint';
import { createRowKey } from './table-utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyPrefix: string;
  isLoading?: boolean;
  emptyMessage?: string;
  hint?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  rowKey?: (row: T, index: number) => string | number;
  // Sorting (controlled)
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  // Pagination (controlled)
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyPrefix,
  isLoading = false,
  emptyMessage = 'No data available',
  hint,
  onRowClick,
  className,
  rowKey,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  const handleSort = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  const renderSortIcon = (col: Column<T>) => {
    if (!col.sortable) return null;
    const isActive = sortColumn === col.key;
    if (!isActive) return <ChevronUp className="ml-1 h-3 w-3 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="p-8 text-center">
          <div className="loading-spinner mx-auto" />
          <p className="mt-2 text-text-muted">Loading data...</p>
        </div>
        {hint && <TableHint>{hint}</TableHint>}
      </div>
    );
  }

  return (
    <div className={cn('table-container', className)}>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    col.sortable && 'cursor-pointer select-none hover:bg-surface-subtle',
                    col.className
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const candidateKey = rowKey ? rowKey(row, idx) : row.id ?? idx;
                const rowKeyValue = createRowKey(keyPrefix, candidateKey);
                return (
                  <tr
                    key={rowKeyValue}
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && 'cursor-pointer hover:bg-surface-subtle')}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.accessor ? col.accessor(row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hint && !isLoading && <TableHint>{hint}</TableHint>}

      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
          <div className="text-sm text-text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, (currentPage || 1) - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, (currentPage || 1) + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}