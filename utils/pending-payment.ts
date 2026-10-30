const KEY = 'ojaly.pendingPayment';
const MAX_AGE_MS = 30 * 60 * 1000;

export interface PendingPayment {
  reference: string;
  createdAt: number;
  returnUrl?: string;
}

export function rememberPayment(reference: string, returnUrl?: string): void {
  if (!import.meta.client || !reference) return;
  try {
    const value: PendingPayment = { reference, createdAt: Date.now(), returnUrl };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch { /* storage can be unavailable */ }
}

export function readPendingPayment(): PendingPayment | null {
  if (!import.meta.client) return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPayment;
    if (!parsed.reference || !parsed.createdAt || Date.now() - parsed.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function clearPendingPayment(): void {
  if (!import.meta.client) return;
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
