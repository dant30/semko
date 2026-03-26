export function setSessionValue(key: string, value: string) {
  sessionStorage.setItem(key, value);
}

export function getSessionValue(key: string) {
  return sessionStorage.getItem(key);
}

export function removeSessionValue(key: string) {
  sessionStorage.removeItem(key);
}
