import { Account, AssetType, Category, Currency, EXCHANGE_RATES, MonthlySummary } from '../types';

export interface AllocationItem {
  id: string;
  name: string;
  value: number;
  category?: Category;
  ownerId?: string;
}

// IDs keep identically named accounts (and categories) separate.
export function buildAllocation(
  records: MonthlySummary[], accounts: Account[], categories: Category[],
  currency: Currency, type: AssetType, groupBy: 'category' | 'account',
): AllocationItem[] {
  const groups = new Map<string, AllocationItem>();
  for (const record of records) {
    const account = accounts.find(a => a.id === record.accountId);
    const category = categories.find(c => c.id === account?.categoryId);
    if ((category?.type ?? 'ASSET') !== type) continue;
    const value = record.amount * EXCHANGE_RATES[account?.currency ?? currency] / EXCHANGE_RATES[currency];
    const id = groupBy === 'account' ? record.accountId : (category?.id ?? 'unknown');
    const existing = groups.get(id);
    if (existing) existing.value += value;
    else groups.set(id, {
      id,
      name: groupBy === 'account' ? (account?.name ?? record.accountId) : (category?.name ?? ''),
      value, category, ownerId: groupBy === 'account' ? account?.ownerId : undefined,
    });
  }
  return [...groups.values()].filter(item => item.value > 0.01).sort((a, b) => b.value - a.value);
}
