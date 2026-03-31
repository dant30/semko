// frontend/src/core/utils/tables.ts
export function createRowKey(prefix: string, id: string | number) {
  return `${prefix}-${id}`;
}
