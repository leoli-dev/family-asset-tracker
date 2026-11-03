import { describe, expect, it } from 'vitest';
import { buildAllocation } from './allocation';
import { Account, Category, Currency, MonthlySummary } from '../types';

const categories: Category[] = [
  { id: 'cash', name: 'Cash', type: 'ASSET', color: '#3b82f6' },
  { id: 'other-cash', name: 'Cash', type: 'ASSET', color: '#10b981' },
  { id: 'debt', name: 'Mortgage', type: 'LIABILITY', color: '#e11d48' },
];
const accounts: Account[] = [
  { id: 'a', name: 'TFSA', currency: Currency.CAD, categoryId: 'cash', ownerId: 'alice' },
  { id: 'b', name: 'TFSA', currency: Currency.USD, categoryId: 'cash', ownerId: 'bob' },
  { id: 'c', name: 'Savings', currency: Currency.CAD, categoryId: 'other-cash', ownerId: 'alice' },
  { id: 'd', name: 'Mortgage', currency: Currency.CAD, categoryId: 'debt', ownerId: 'alice' },
];
const record = (accountId: string, amount: number): MonthlySummary => ({ accountId, amount, month: '2026-11', date: '2026-11-03' });

describe('allocation of latest balances', () => {
  it('keeps same-name accounts separate with their owners, converts currency, and ranks by value', () => {
    const result = buildAllocation([record('a', 100), record('b', 100)], accounts, categories, Currency.CAD, 'ASSET', 'account');
    expect(result.map(item => item.id)).toEqual(['b', 'a']);
    expect(result.map(item => item.ownerId)).toEqual(['bob', 'alice']);
    expect(result[0].value).toBeCloseTo(100 / 0.74);
    expect(result[1].value).toBe(100);
  });

  it('sums by category ID without merging same-name categories', () => {
    const result = buildAllocation([record('a', 100), record('b', 74), record('c', 50)], accounts, categories, Currency.CAD, 'ASSET', 'category');
    expect(result.map(item => [item.id, item.value])).toEqual([['cash', 200], ['other-cash', 50]]);
  });

  it('separates liabilities from assets', () => {
    const records = [record('a', 100), record('d', 500)];
    expect(buildAllocation(records, accounts, categories, Currency.CAD, 'ASSET', 'account').map(item => item.id)).toEqual(['a']);
    expect(buildAllocation(records, accounts, categories, Currency.CAD, 'LIABILITY', 'account').map(item => item.id)).toEqual(['d']);
  });

  it('omits nonpositive groups while retaining small positive balances', () => {
    const result = buildAllocation([record('a', 0), record('b', -10), record('c', 0.02)], accounts, categories, Currency.CAD, 'ASSET', 'account');
    expect(result.map(item => item.id)).toEqual(['c']);
    expect(buildAllocation([], accounts, categories, Currency.CAD, 'ASSET', 'account')).toEqual([]);
  });

  it('retains uncategorized balances in the default currency', () => {
    const result = buildAllocation([record('missing', 25)], accounts, categories, Currency.CAD, 'ASSET', 'category');
    expect(result).toEqual([{ id: 'unknown', name: '', value: 25, category: undefined, ownerId: undefined }]);
  });
});
