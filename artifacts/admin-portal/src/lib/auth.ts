const KEY = "bde_admin_secret";

export function getSecret(): string | null {
  return sessionStorage.getItem(KEY);
}

export function setSecret(secret: string): void {
  sessionStorage.setItem(KEY, secret);
}

export function clearSecret(): void {
  sessionStorage.removeItem(KEY);
}
