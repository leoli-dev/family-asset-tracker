
import { AssetRecord, Currency, Account, Category, Owner } from '../types';

// 1. Define Static Entities
export const INITIAL_OWNERS: Owner[] = [
    { id: 'own_alice', name: 'Alice' },
    { id: 'own_bob', name: 'Bob' },
    { id: 'own_joint', name: 'Family Joint' },
];

export const INITIAL_CATEGORIES: Category[] = [
    { id: 'cat_cash', name: 'Cash & Savings', type: 'ASSET', color: '#10b981' }, // Emerald
    { id: 'cat_stock', name: 'Investments', type: 'ASSET', color: '#3b82f6' }, // Blue
    { id: 'cat_real_estate', name: 'Real Estate', type: 'ASSET', color: '#f59e0b' }, // Amber
    { id: 'cat_crypto', name: 'Crypto', type: 'ASSET', color: '#8b5cf6' }, // Violet
    { id: 'cat_vehicle', name: 'Vehicle', type: 'ASSET', color: '#06b6d4' }, // Cyan
    { id: 'cat_mortgage', name: 'Mortgage', type: 'LIABILITY', color: '#ef4444' }, // Red
    { id: 'cat_credit', name: 'Credit Card', type: 'LIABILITY', color: '#f43f5e' }, // Rose
    { id: 'cat_loan', name: 'Personal Loan', type: 'LIABILITY', color: '#fb923c' }, // Orange
];

export const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc_checking', name: 'Chase Checking', currency: Currency.USD },
    { id: 'acc_savings', name: 'Ally Savings', currency: Currency.USD },
    { id: 'acc_401k', name: 'Fidelity 401k', currency: Currency.USD },
    { id: 'acc_home', name: 'Primary Home', currency: Currency.USD },
    { id: 'acc_car', name: 'Toyota RAV4', currency: Currency.USD },
    { id: 'acc_coinbase', name: 'Coinbase', currency: Currency.USD },
    { id: 'acc_mortgage', name: 'Home Loan', currency: Currency.USD },
    { id: 'acc_visa', name: 'Chase Sapphire', currency: Currency.USD },
];

// 2. Generate Historical Records
const generateRecords = (): AssetRecord[] => {
    const records: AssetRecord[] = [];
    const now = new Date();
    const monthsToGenerate = 12; 

    // Helper to simulate a monthly entry
    // We store liabilities as POSITIVE amounts in the record (debt amount), 
    // the UI logic converts them to negative based on Category Type.
    const addRecord = (monthOffset: number, accountId: string, ownerId: string, categoryId: string, baseAmount: number, growthRate: number, volatility: number) => {
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate Amount
        const timeFactor = (monthsToGenerate - monthOffset); 
        let amount = baseAmount + (baseAmount * growthRate * timeFactor);
        
        if (volatility > 0) {
            const randomFluctuation = 1 + ((Math.random() * 2 - 1) * volatility);
            amount = amount * randomFluctuation;
        }
        
        records.push({
            id: `rec_${monthOffset}_${accountId}`,
            date: dateStr,
            accountId,
            ownerId,
            categoryId,
            amount: Math.round(Math.max(0, amount)),
            timestamp: date.getTime(),
            note: monthOffset === 0 ? 'Current Balance' : undefined
        });
    };

    for (let i = monthsToGenerate - 1; i >= 0; i--) {
        // ASSETS
        // Cash: Stable
        addRecord(i, 'acc_checking', 'own_alice', 'cat_cash', 8000, 0.01, 0.05);
        addRecord(i, 'acc_savings', 'own_joint', 'cat_cash', 45000, 0.005, 0.01);

        // Investments: Growth
        addRecord(i, 'acc_401k', 'own_bob', 'cat_stock', 120000, 0.02, 0.03);

        // Real Estate: Slow Growth
        addRecord(i, 'acc_home', 'own_joint', 'cat_real_estate', 650000, 0.003, 0.0);

        // Vehicle: Depreciation
        addRecord(i, 'acc_car', 'own_alice', 'cat_vehicle', 35000, -0.015, 0.0);

        // Crypto: Volatile
        addRecord(i, 'acc_coinbase', 'own_bob', 'cat_crypto', 15000, 0.08, 0.15);

        // LIABILITIES
        // Mortgage: Starts high, decreases (negative growth implies balance going down)
        // Note: Logic here simulates the 'Balance' of the loan. 
        addRecord(i, 'acc_mortgage', 'own_joint', 'cat_mortgage', 480000, -0.002, 0.0);
        
        // Credit Card: Fluctuating
        addRecord(i, 'acc_visa', 'own_joint', 'cat_credit', 3500, 0.0, 0.2);
    }

    return records;
};

export const DEMO_RECORDS = generateRecords();
