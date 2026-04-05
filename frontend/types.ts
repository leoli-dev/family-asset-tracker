
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  GBP = 'GBP',
  CNY = 'CNY',
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  HKD = 'HKD',
  SGD = 'SGD',
  SEK = 'SEK',
  KRW = 'KRW',
  NOK = 'NOK',
  NZD = 'NZD',
  INR = 'INR',
  MXN = 'MXN',
  TWD = 'TWD',
  ZAR = 'ZAR',
  BRL = 'BRL',
  DKK = 'DKK',
  PLN = 'PLN',
  THB = 'THB',
  IDR = 'IDR',
  MYR = 'MYR',
  VND = 'VND'
}

export enum Language {
  EN = 'en',
  FR = 'fr',
  ZH = 'zh'
}

export enum AssetCategory {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  CASH = 'CASH',
  REAL_ESTATE = 'REAL_ESTATE',
  INSURANCE = 'INSURANCE',
  LIABILITY = 'LIABILITY',
  OTHER = 'OTHER'
}

export type AssetType = 'ASSET' | 'LIABILITY';

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  categoryId: string; // Linked to a specific category
  ownerId: string; // Linked to an owner
}

export interface Category {
  id: string;
  name: string;
  type: AssetType;
  color: string;
}

export interface Owner {
  id: string;
  name: string;
}

export interface AssetRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  accountId: string;
  amount: number;
  note?: string;
  timestamp: number; // For sorting
}

export interface AppState {
  defaultCurrency: Currency;
  records: AssetRecord[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  logoUrl: string | null;
}

export interface FullBackup {
  metadata: {
    version: string;
    timestamp: number;
    exportDate: string;
  };
  records: AssetRecord[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
}

export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1.0,
  [Currency.EUR]: 1.09,
  [Currency.JPY]: 0.0067,
  [Currency.GBP]: 1.27,
  [Currency.CNY]: 0.14,
  [Currency.AUD]: 0.66,
  [Currency.CAD]: 0.74,
  [Currency.CHF]: 1.13,
  [Currency.HKD]: 0.13,
  [Currency.SGD]: 0.74,
  [Currency.SEK]: 0.097,
  [Currency.KRW]: 0.00075,
  [Currency.NOK]: 0.094,
  [Currency.NZD]: 0.61,
  [Currency.INR]: 0.012,
  [Currency.MXN]: 0.059,
  [Currency.TWD]: 0.031,
  [Currency.ZAR]: 0.053,
  [Currency.BRL]: 0.20,
  [Currency.DKK]: 0.15,
  [Currency.PLN]: 0.25,
  [Currency.THB]: 0.028,
  [Currency.IDR]: 0.000064,
  [Currency.MYR]: 0.21,
  [Currency.VND]: 0.00004
};
