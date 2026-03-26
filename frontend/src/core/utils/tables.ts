export function createRowKey(prefix: string, id: string | number) {
  return `${prefix}-${id}`;
}
