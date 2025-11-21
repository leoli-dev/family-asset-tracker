
import { AssetRecord, AssetCategory, Currency } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const TODAY = new Date();

// Helper to get a date string for X months ago
// Sets day to 15 to avoid timezone/month-end issues
const getDateStr = (monthsAgo: number) => {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(15); 
  return d.toISOString().split('T')[0];
};

// Helper to generate timestamp
const getTimestamp = (monthsAgo: number) => {
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(15);
    return d.getTime();
};

const ACCOUNTS = [
    {
        name: 'Chase Checking',
        owner: 'John',
        currency: Currency.USD,
        category: AssetCategory.CASH,
        baseAmount: 8000,
        monthlyChange: 400, // Savings accumulation
        volatility: 0.05
    },
    {
        name: 'Vanguard ETF',
        owner: 'John',
        currency: Currency.USD,
        category: AssetCategory.STOCK,
        baseAmount: 25000,
        monthlyChange: 500, // Monthly contribution
        volatility: 0.08 // Market fluctuation
    },
    {
        name: 'Bitcoin Wallet',
        owner: 'Mary',
        currency: Currency.CAD,
        category: AssetCategory.CRYPTO,
        baseAmount: 5000,
        monthlyChange: 0,
        volatility: 0.25 // High volatility
    },
    {
        name: 'Tokyo Condo',
        owner: 'Joint',
        currency: Currency.JPY,
        category: AssetCategory.REAL_ESTATE,
        baseAmount: 48000000,
        monthlyChange: 0, 
        volatility: 0.005 // Very stable
    },
    {
        name: 'Car Loan',
        owner: 'Joint',
        currency: Currency.USD,
        category: AssetCategory.LIABILITY,
        baseAmount: 18000,
        monthlyChange: -350, // Paying off debt
        volatility: 0
    },
    {
        name: 'Visa Credit Card',
        owner: 'John',
        currency: Currency.USD,
        category: AssetCategory.LIABILITY,
        baseAmount: 2000,
        monthlyChange: 0,
        volatility: 0.4 // Spending habits vary
    },
     {
        name: 'Emergency Fund',
        owner: 'Joint',
        currency: Currency.EUR,
        category: AssetCategory.CASH,
        baseAmount: 10000,
        monthlyChange: 100,
        volatility: 0.01
    }
];

const generateDemoRecords = (): AssetRecord[] => {
    const records: AssetRecord[] = [];
    const monthsToGenerate = 12; // Full year
    
    // i represents months ago (11 = 11 months ago, 0 = current month)
    for (let i = monthsToGenerate - 1; i >= 0; i--) {
        ACCOUNTS.forEach(acc => {
            // Calculate logical amount based on time progression
            const monthsPassed = (monthsToGenerate - 1) - i; 
            
            // Linear trend: Start + (Change * Months)
            let amount = acc.baseAmount + (acc.monthlyChange * monthsPassed);
            
            // Add randomness/Volatility
            if (acc.volatility > 0) {
                // Random factor between (1 - vol) and (1 + vol)
                // e.g. vol 0.05 => 0.95 to 1.05
                const randomFactor = 1 + ((Math.random() * 2 - 1) * acc.volatility);
                amount = amount * randomFactor;
            }

            // Ensure no negative amounts (unless semantically meaningful, but app expects positive inputs)
            if (amount < 0) amount = 0;

            records.push({
                id: generateId(),
                date: getDateStr(i),
                accountName: acc.name,
                owner: acc.owner,
                currency: acc.currency,
                amount: Math.round(amount), // Keep it clean integers
                category: acc.category,
                note: i === 0 ? 'Latest automated update' : undefined, 
                timestamp: getTimestamp(i)
            });
        });
    }
    return records;
};

export const DEMO_RECORDS = generateDemoRecords();
