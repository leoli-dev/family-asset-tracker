
import React, { useMemo, useState } from 'react';
import { AssetRecord, AssetCategory, Currency, EXCHANGE_RATES, Language } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { t, CATEGORY_LABELS } from '../utils/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart as PieChartIcon, Layers } from 'lucide-react';

interface DashboardProps {
  records: AssetRecord[];
  defaultCurrency: Currency;
  language: Language;
}

// Palette for Account-based view (since we don't have fixed colors for user-defined accounts)
const ACCOUNT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', 
  '#ef4444', '#64748b', '#ec4899', '#84cc16', '#f97316', 
  '#6366f1', '#14b8a6', '#d946ef', '#f43f5e', '#eab308'
];

export const Dashboard: React.FC<DashboardProps> = ({ records, defaultCurrency, language }) => {
  const [allocationBy, setAllocationBy] = useState<'category' | 'account'>('category');
  
  // Helper to convert any amount to default currency
  const convertToDefault = (amount: number, currency: Currency): number => {
    if (currency === defaultCurrency) return amount;
    // Convert to USD first, then to default
    const amountInUSD = amount * EXCHANGE_RATES[currency];
    const rateDefaultToUSD = EXCHANGE_RATES[defaultCurrency];
    return amountInUSD / rateDefaultToUSD;
  };

  // 1. Calculate Latest Records (Snapshot)
  const latestRecords = useMemo(() => {
    const latestRecordsMap = new Map<string, AssetRecord>();
    
    records.forEach(record => {
      const key = `${record.accountName}-${record.owner}`; // Unique identifier for an account
      const existing = latestRecordsMap.get(key);
      if (!existing || new Date(record.date) > new Date(existing.date) || (record.date === existing.date && record.timestamp > existing.timestamp)) {
        latestRecordsMap.set(key, record);
      }
    });

    return Array.from(latestRecordsMap.values());
  }, [records]);

  // 2. Calculate Totals (Assets vs Liabilities)
  const totals = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;

    latestRecords.forEach(rec => {
      const val = convertToDefault(rec.amount, rec.currency);
      if (rec.category === AssetCategory.LIABILITY) {
        totalLiabilities += val;
      } else {
        totalAssets += val;
      }
    });

    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  }, [latestRecords, defaultCurrency]);

  // 3. Calculate Asset Pie Chart Data (Exclude Liabilities, handle grouping)
  const pieData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    latestRecords.forEach(rec => {
        // IMPORTANT: Exclude liabilities from Asset Allocation chart
        if (rec.category === AssetCategory.LIABILITY) return;

        const val = convertToDefault(rec.amount, rec.currency);
        
        const key = allocationBy === 'category' ? rec.category : rec.accountName;
        dataMap[key] = (dataMap[key] || 0) + val;
    });

    return Object.keys(dataMap).map(key => ({
        name: key,
        displayName: allocationBy === 'category' 
            ? CATEGORY_LABELS[language][key as AssetCategory] 
            : key,
        value: dataMap[key]
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value); // Sort desc
  }, [latestRecords, allocationBy, defaultCurrency, language]);

  // 4. Calculate Trends (Group by Month)
  const trendData = useMemo(() => {
    if (records.length === 0) return [];

    // Get all unique months
    const months = Array.from(new Set(records.map(r => r.date.substring(0, 7)))).sort();
    
    return months.map(month => {
      const accountLatestInMonth = new Map<string, AssetRecord>();
      const relevantRecords = records.filter(r => r.date.substring(0, 7) <= month);
      
      relevantRecords.forEach(record => {
         const key = `${record.accountName}-${record.owner}`;
         const existing = accountLatestInMonth.get(key);
         if (!existing || record.date > existing.date || (record.date === existing.date && record.timestamp > existing.timestamp)) {
           accountLatestInMonth.set(key, record);
         }
      });

      let assets = 0;
      let liabilities = 0;
      
      Array.from(accountLatestInMonth.values()).forEach(rec => {
        const val = convertToDefault(rec.amount, rec.currency);
         if (rec.category === AssetCategory.LIABILITY) {
          liabilities += val;
        } else {
          assets += val;
        }
      });

      return {
        name: month,
        Assets: Math.round(assets),
        Liabilities: Math.round(liabilities),
        NetWorth: Math.round(assets - liabilities)
      };
    });
  }, [records, defaultCurrency]);

  // 5. Calculate Liability Pie Chart Data (Only Liabilities, grouped by Account)
  const liabilityPieData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    latestRecords.forEach(rec => {
        if (rec.category !== AssetCategory.LIABILITY) return;

        const val = convertToDefault(rec.amount, rec.currency);
        // Grouping by account as requested
        const key = rec.accountName;
        dataMap[key] = (dataMap[key] || 0) + val;
    });

    return Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [latestRecords, defaultCurrency]);


  const formatMoney = (val: number) => {
    return new Intl.NumberFormat(language === Language.EN ? 'en-US' : (language === Language.FR ? 'fr-FR' : 'zh-CN'), {
      style: 'currency',
      currency: defaultCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  if (records.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 mt-10">
        <Wallet size={48} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold mb-2">{t('dash.noData', language)}</h2>
        <p>{t('dash.start', language)}</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      
      {/* 1. Summary Cards - Mobile Compact View */}
      <div className="md:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-center">
           <span className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
             <Wallet size={16} className="text-blue-500"/>
             {t('dash.netWorth', language)}
           </span>
           <span className={`text-xl font-bold ${totals.netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
             {formatMoney(totals.netWorth)}
           </span>
        </div>
        <div className="w-full h-px bg-slate-100"></div>
        <div className="flex justify-between items-center">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500"/> {t('dash.assets', language)}
              </span>
              <span className="text-sm font-bold text-emerald-600">{formatMoney(totals.totalAssets)}</span>
           </div>
           <div className="h-8 w-px bg-slate-100 mx-2"></div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                {t('dash.liabilities', language)} <TrendingDown size={12} className="text-red-500"/>
              </span>
              <span className="text-sm font-bold text-red-600">{formatMoney(totals.totalLiabilities)}</span>
           </div>
        </div>
      </div>

      {/* 1. Summary Cards - Desktop View (Original Grid) */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t('dash.netWorth', language)}</h3>
            <Wallet className="text-blue-500" size={20} />
          </div>
          <p className={`text-2xl font-bold ${totals.netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatMoney(totals.netWorth)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t('dash.assets', language)}</h3>
             <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatMoney(totals.totalAssets)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t('dash.liabilities', language)}</h3>
            <TrendingDown className="text-red-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatMoney(totals.totalLiabilities)}</p>
        </div>
      </div>

      {/* 2. Trend Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('dash.trend', language)}</h3>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Legend />
              <Line type="monotone" dataKey="Assets" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Liabilities" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="NetWorth" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Asset Allocation Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800">{t('dash.allocation', language)}</h3>
            
            {/* Toggle Switch */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                    onClick={() => setAllocationBy('category')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <PieChartIcon size={14} />
                    {t('dash.byCategory', language)}
                </button>
                <button
                    onClick={() => setAllocationBy('account')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layers size={14} />
                    {t('dash.byAccount', language)}
                </button>
            </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="displayName"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={allocationBy === 'category' 
                        ? (CATEGORY_COLORS[entry.name as AssetCategory] || '#ccc') 
                        : ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]
                    } 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Liability Distribution Chart */}
      {liabilityPieData.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{t('dash.liabilitiesDist', language)}</h3>
            <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={liabilityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                >
                    {liabilityPieData.map((entry, index) => (
                    <Cell 
                        key={`cell-lia-${index}`} 
                        fill={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]} 
                    />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
            </div>
        </div>
      )}

    </div>
  );
};
