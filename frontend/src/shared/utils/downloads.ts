// frontend/src/shared/utils/downloads.ts
/**
 * Trigger a file download by opening a new tab or window.
 * @param url - File URL
 * @param target - '_blank' (default) or '_self'
 */
export function downloadFile(url: string, target: '_blank' | '_self' = '_blank'): void {
  window.open(url, target, 'noopener,noreferrer');
}

/**
 * Trigger a download from a Blob object.
 * @param blob - Blob data
 * @param filename - File name for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}