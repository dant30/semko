export function setLocalValue(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalValue(key: string) {
  return localStorage.getItem(key);
}

export function removeLocalValue(key: string) {
  localStorage.removeItem(key);
}
