
import { AssetRecord, Currency, Account, Category, Owner } from '../types';

// 1. Generate UUIDs for consistency (simulating real database IDs)
const OWNER_IDS = {
    ALICE: crypto.randomUUID(),
    BOB: crypto.randomUUID(),
    JOINT: crypto.randomUUID(),
};

const CAT_IDS = {
    CASH: crypto.randomUUID(),
    STOCK: crypto.randomUUID(),
    REAL_ESTATE: crypto.randomUUID(),
    CRYPTO: crypto.randomUUID(),
    VEHICLE: crypto.randomUUID(),
    MORTGAGE: crypto.randomUUID(),
    CREDIT: crypto.randomUUID(),
    LOAN: crypto.randomUUID(),
};

const ACC_IDS = {
    CHECKING: crypto.randomUUID(),
    SAVINGS: crypto.randomUUID(),
    K401: crypto.randomUUID(),
    HOME: crypto.randomUUID(),
    CAR: crypto.randomUUID(),
    COINBASE: crypto.randomUUID(),
    MORTGAGE: crypto.randomUUID(),
    VISA: crypto.randomUUID(),
    LOAN: crypto.randomUUID(),
};

// 2. Define Static Entities using generated IDs
export const INITIAL_OWNERS: Owner[] = [
    { id: OWNER_IDS.ALICE, name: 'Alice' },
    { id: OWNER_IDS.BOB, name: 'Bob' },
    { id: OWNER_IDS.JOINT, name: 'Family Joint' },
];

export const INITIAL_CATEGORIES: Category[] = [
    { id: CAT_IDS.CASH, name: 'Cash & Savings', type: 'ASSET', color: '#10b981' }, // Emerald
    { id: CAT_IDS.STOCK, name: 'Investments', type: 'ASSET', color: '#3b82f6' }, // Blue
    { id: CAT_IDS.REAL_ESTATE, name: 'Real Estate', type: 'ASSET', color: '#f59e0b' }, // Amber
    { id: CAT_IDS.CRYPTO, name: 'Crypto', type: 'ASSET', color: '#8b5cf6' }, // Violet
    { id: CAT_IDS.VEHICLE, name: 'Vehicle', type: 'ASSET', color: '#06b6d4' }, // Cyan
    { id: CAT_IDS.MORTGAGE, name: 'Mortgage', type: 'LIABILITY', color: '#ef4444' }, // Red
    { id: CAT_IDS.CREDIT, name: 'Credit Card', type: 'LIABILITY', color: '#f43f5e' }, // Rose
    { id: CAT_IDS.LOAN, name: 'Personal Loan', type: 'LIABILITY', color: '#fb923c' }, // Orange
];

export const INITIAL_ACCOUNTS: Account[] = [
    { id: ACC_IDS.CHECKING, name: 'Chase Checking', currency: Currency.USD, categoryId: CAT_IDS.CASH, ownerId: OWNER_IDS.ALICE },
    { id: ACC_IDS.SAVINGS, name: 'Ally Savings', currency: Currency.USD, categoryId: CAT_IDS.CASH, ownerId: OWNER_IDS.JOINT },
    { id: ACC_IDS.K401, name: 'Fidelity 401k', currency: Currency.USD, categoryId: CAT_IDS.STOCK, ownerId: OWNER_IDS.BOB },
    { id: ACC_IDS.HOME, name: 'Primary Home', currency: Currency.USD, categoryId: CAT_IDS.REAL_ESTATE, ownerId: OWNER_IDS.JOINT },
    { id: ACC_IDS.CAR, name: 'Toyota RAV4', currency: Currency.USD, categoryId: CAT_IDS.VEHICLE, ownerId: OWNER_IDS.ALICE },
    { id: ACC_IDS.COINBASE, name: 'Coinbase', currency: Currency.USD, categoryId: CAT_IDS.CRYPTO, ownerId: OWNER_IDS.BOB },
    { id: ACC_IDS.MORTGAGE, name: 'Home Loan', currency: Currency.USD, categoryId: CAT_IDS.MORTGAGE, ownerId: OWNER_IDS.JOINT },
    { id: ACC_IDS.VISA, name: 'Chase Sapphire', currency: Currency.USD, categoryId: CAT_IDS.CREDIT, ownerId: OWNER_IDS.JOINT },
    { id: ACC_IDS.LOAN, name: 'Upstart Loan', currency: Currency.USD, categoryId: CAT_IDS.LOAN, ownerId: OWNER_IDS.ALICE },
];

// 3. Generate Historical Records
const generateRecords = (): AssetRecord[] => {
    const records: AssetRecord[] = [];
    const now = new Date();
    const monthsToGenerate = 12; 

    // Helper to simulate a monthly entry
    const addRecord = (monthOffset: number, accountId: string, baseAmount: number, growthRate: number, volatility: number) => {
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const dateStr = date.toISOString().split('T')[0];
        const ownerId = INITIAL_ACCOUNTS.find(a => a.id === accountId)?.ownerId || OWNER_IDS.JOINT;
        
        // Calculate Amount
        let amount = 0;
        if (baseAmount > 0) {
            const timeFactor = (monthsToGenerate - monthOffset); 
            amount = baseAmount + (baseAmount * growthRate * timeFactor);
            
            if (volatility > 0) {
                const randomFluctuation = 1 + ((Math.random() * 2 - 1) * volatility);
                amount = amount * randomFluctuation;
            }
        }
        
        records.push({
            id: crypto.randomUUID(),
            date: dateStr,
            accountId,
            // categoryId is now inferred from Account
            amount: Math.round(Math.max(0, amount)),
            timestamp: date.getTime(),
            note: monthOffset === 0 ? 'Current Balance' : undefined
        });
    };

    for (let i = monthsToGenerate - 1; i >= 0; i--) {
        // ASSETS
        // Cash: Stable
        addRecord(i, ACC_IDS.CHECKING, 8000, 0.01, 0.05);
        addRecord(i, ACC_IDS.SAVINGS, 45000, 0.005, 0.01);

        // Investments: Growth
        addRecord(i, ACC_IDS.K401, 120000, 0.02, 0.03);

        // Real Estate: Slow Growth
        addRecord(i, ACC_IDS.HOME, 650000, 0.003, 0.0);

        // Vehicle: Depreciation
        addRecord(i, ACC_IDS.CAR, 35000, -0.015, 0.0);

        // Crypto: Volatile AND SOLD OFF RECENTLY
        if (i < 2) {
            addRecord(i, ACC_IDS.COINBASE, 0, 0, 0);
        } else {
            addRecord(i, ACC_IDS.COINBASE, 15000, 0.08, 0.15);
        }

        // LIABILITIES
        // Mortgage: Starts high, decreases
        addRecord(i, ACC_IDS.MORTGAGE, 480000, -0.002, 0.0);
        
        // Credit Card: Fluctuating
        addRecord(i, ACC_IDS.VISA, 3500, 0.0, 0.2);

        // Personal Loan: PAID OFF RECENTLY
        if (i < 4) {
            addRecord(i, ACC_IDS.LOAN, 0, 0, 0);
        } else {
            addRecord(i, ACC_IDS.LOAN, 12000, -0.05, 0);
        }
    }

    return records;
};

export const DEMO_RECORDS = generateRecords();
