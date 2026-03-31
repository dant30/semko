// frontend/src/core/utils/dates.ts
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
