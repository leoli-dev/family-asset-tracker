/**
 * Thin API client.
 * - Reads the token from localStorage ('fat_token')
 * - Injects Authorization: Bearer header on every request
 * - Throws on non-2xx; redirects to /login on 401
 */

import type {
  Account,
  AssetRecord,
  Category,
  FullBackup,
  MonthlySummary,
  Owner,
} from '../types';

const TOKEN_KEY = 'fat_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    cache: 'no-store',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export async function verifyToken(token: string): Promise<boolean> {
  const res = await fetch('/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// ---------- Settings ----------

export interface Settings {
  defaultCurrency: string;
  language: string;
}

export function fetchSettings(): Promise<Settings> {
  return request('GET', '/api/settings');
}

export function saveSettings(payload: Partial<Settings>): Promise<Settings> {
  return request('PUT', '/api/settings', payload);
}

// ---------- Owners ----------

export function fetchOwners(): Promise<Owner[]> {
  return request('GET', '/api/owners');
}

export function createOwner(owner: Owner): Promise<Owner> {
  return request('POST', '/api/owners', owner);
}

export function updateOwner(id: string, name: string): Promise<Owner> {
  return request('PUT', `/api/owners/${id}`, { name });
}

export function deleteOwner(id: string): Promise<void> {
  return request('DELETE', `/api/owners/${id}`);
}

// ---------- Categories ----------

export function fetchCategories(): Promise<Category[]> {
  return request('GET', '/api/categories');
}

export function createCategory(cat: Category): Promise<Category> {
  return request('POST', '/api/categories', cat);
}

export function updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
  return request('PUT', `/api/categories/${id}`, payload);
}

export function deleteCategory(id: string): Promise<void> {
  return request('DELETE', `/api/categories/${id}`);
}

// ---------- Accounts ----------

export function fetchAccounts(): Promise<Account[]> {
  return request('GET', '/api/accounts');
}

export function createAccount(acc: Account): Promise<Account> {
  return request('POST', '/api/accounts', acc);
}

export function updateAccount(id: string, payload: Partial<Account>): Promise<Account> {
  return request('PUT', `/api/accounts/${id}`, payload);
}

export function deleteAccount(id: string): Promise<void> {
  return request('DELETE', `/api/accounts/${id}`);
}

// ---------- Records ----------

export function fetchMonthlySummaries(): Promise<MonthlySummary[]> {
  return request('GET', '/api/records/monthly-summary');
}

export function fetchRecords(params?: {
  accountId?: string;
  from?: string;
  to?: string;
}): Promise<AssetRecord[]> {
  const qs = new URLSearchParams();
  if (params?.accountId) qs.set('accountId', params.accountId);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const query = qs.toString() ? `?${qs}` : '';
  return request('GET', `/api/records${query}`);
}

export function createRecord(record: AssetRecord): Promise<AssetRecord> {
  return request('POST', '/api/records', record);
}

export function updateRecord(id: string, payload: Partial<AssetRecord>): Promise<AssetRecord> {
  return request('PUT', `/api/records/${id}`, payload);
}

export function deleteRecord(id: string): Promise<void> {
  return request('DELETE', `/api/records/${id}`);
}

// ---------- Backup / Restore / CSV ----------

export function fetchBackup(): Promise<FullBackup> {
  return request('GET', '/api/backup');
}

export function restoreBackup(backup: FullBackup): Promise<void> {
  return request('POST', '/api/restore', backup);
}

/**
 * Fetches CSV from the backend and triggers a browser file download.
 */
export async function downloadCsv() {
  const token = getToken();
  const res = await fetch('/api/export/csv', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('CSV export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const filename =
    res.headers.get('content-disposition')?.match(/filename="(.+?)"/)?.[1] ??
    `family_asset_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
