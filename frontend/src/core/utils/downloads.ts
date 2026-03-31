// frontend/src/core/utils/downloads.ts
export function downloadFile(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
