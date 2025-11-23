
import { AssetRecord, Currency, Account, Category, Owner } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const TODAY = new Date();
const getDateStr = (monthsAgo: number) => {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(15); 
  return d.toISOString().split('T')[0];
};

const getTimestamp = (monthsAgo: number) => {
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(15);
    return d.getTime();
};

// Initial Categories
export const INITIAL_CATEGORIES: Category[] = [
    { id: 'cat_cash', name: 'Cash/Savings', type: 'ASSET', color: '#10b981' },
    { id: 'cat_stock', name: 'Stock Investment', type: 'ASSET', color: '#3b82f6' },
    { id: 'cat_crypto', name: 'Cryptocurrency', type: 'ASSET', color: '#8b5cf6' },
    { id: 'cat_real_estate', name: 'Real Estate', type: 'ASSET', color: '#f59e0b' },
    { id: 'cat_vehicle', name: 'Vehicle', type: 'ASSET', color: '#06b6d4' },
    { id: 'cat_liability', name: 'Loan/Debt', type: 'LIABILITY', color: '#ef4444' },
];

// Initial Owners
export const INITIAL_OWNERS: Owner[] = [
    { id: 'own_john', name: 'John' },
    { id: 'own_mary', name: 'Mary' },
    { id: 'own_joint', name: 'Joint' },
];

// Initial Accounts
export const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc_chase', name: 'Chase Checking', currency: Currency.USD },
    { id: 'acc_vanguard', name: 'Vanguard ETF', currency: Currency.USD },
    { id: 'acc_btc', name: 'Bitcoin Wallet', currency: Currency.CAD },
    { id: 'acc_condo', name: 'Tokyo Condo', currency: Currency.JPY },
    { id: 'acc_car_loan', name: 'Car Loan', currency: Currency.USD },
    { id: 'acc_visa', name: 'Visa Credit Card', currency: Currency.USD },
    { id: 'acc_emergency', name: 'Emergency Fund', currency: Currency.EUR },
];

// Simulation Config
const SIMULATION_CONFIG = [
    { accountId: 'acc_chase', ownerId: 'own_john', categoryId: 'cat_cash', base: 8000, change: 400, vol: 0.05 },
    { accountId: 'acc_vanguard', ownerId: 'own_john', categoryId: 'cat_stock', base: 25000, change: 500, vol: 0.08 },
    { accountId: 'acc_btc', ownerId: 'own_mary', categoryId: 'cat_crypto', base: 5000, change: 0, vol: 0.25 },
    { accountId: 'acc_condo', ownerId: 'own_joint', categoryId: 'cat_real_estate', base: 48000000, change: 0, vol: 0.005 },
    { accountId: 'acc_car_loan', ownerId: 'own_joint', categoryId: 'cat_liability', base: 18000, change: -350, vol: 0 },
    { accountId: 'acc_visa', ownerId: 'own_john', categoryId: 'cat_liability', base: 2000, change: 0, vol: 0.4 },
    { accountId: 'acc_emergency', ownerId: 'own_joint', categoryId: 'cat_cash', base: 10000, change: 100, vol: 0.01 },
];

const generateDemoRecords = (): AssetRecord[] => {
    const records: AssetRecord[] = [];
    const monthsToGenerate = 36; 
    
    for (let i = monthsToGenerate - 1; i >= 0; i--) {
        SIMULATION_CONFIG.forEach(sim => {
            const monthsPassed = (monthsToGenerate - 1) - i; 
            let amount = sim.base + (sim.change * monthsPassed);
            if (sim.vol > 0) {
                const randomFactor = 1 + ((Math.random() * 2 - 1) * sim.vol);
                amount = amount * randomFactor;
            }
            if (amount < 0) amount = 0;

            records.push({
                id: generateId(),
                date: getDateStr(i),
                accountId: sim.accountId,
                ownerId: sim.ownerId,
                categoryId: sim.categoryId,
                amount: Math.round(amount),
                note: i === 0 ? 'Latest automated update' : undefined, 
                timestamp: getTimestamp(i)
            });
        });
    }
    return records;
};

export const DEMO_RECORDS = generateDemoRecords();
