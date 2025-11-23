
import React, { useMemo, useState } from 'react';
import { AssetRecord, Currency, EXCHANGE_RATES, Language, Account, Category, Owner } from '../types';
import { t } from '../utils/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ComposedChart, Line, Bar, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Layers, Filter } from 'lucide-react';

interface DashboardProps {
  records: AssetRecord[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  defaultCurrency: Currency;
  language: Language;
}

// Palette for random colors if needed, though we use category colors mostly
const ACCOUNT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', 
  '#ef4444', '#64748b', '#ec4899', '#84cc16', '#f97316', 
  '#6366f1', '#14b8a6', '#d946ef', '#f43f5e', '#eab308'
];

export const Dashboard: React.FC<DashboardProps> = ({ records, accounts, categories, owners, defaultCurrency, language }) => {
  const [allocationBy, setAllocationBy] = useState<'category' | 'account'>('category');
  const [trendAllocationBy, setTrendAllocationBy] = useState<'category' | 'account'>('category');
  const [timeRange, setTimeRange] = useState<string>('12m'); 
  
  // Helpers for lookups
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id;
  const getAccountCurrency = (id: string) => accounts.find(a => a.id === id)?.currency || defaultCurrency;
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';
  const isLiabilityCategory = (id: string) => categories.find(c => c.id === id)?.type === 'LIABILITY';

  // 1. Calculate Latest Records (Snapshot)
  const latestRecords = useMemo(() => {
    const latestRecordsMap = new Map<string, AssetRecord>();
    records.forEach(record => {
      // Key by Account + Owner (unique combination for asset tracking)
      const key = `${record.accountId}-${record.ownerId}`; 
      const existing = latestRecordsMap.get(key);
      if (!existing || new Date(record.date) > new Date(existing.date) || (record.date === existing.date && record.timestamp > existing.timestamp)) {
        latestRecordsMap.set(key, record);
      }
    });
    return Array.from(latestRecordsMap.values());
  }, [records]);

  // Helper to convert any amount to default currency
  const convertToDefault = (amount: number, currency: Currency): number => {
    if (currency === defaultCurrency) return amount;
    const amountInUSD = amount * EXCHANGE_RATES[currency];
    const rateDefaultToUSD = EXCHANGE_RATES[defaultCurrency];
    return amountInUSD / rateDefaultToUSD;
  };

  // 2. Calculate Totals
  const totals = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    latestRecords.forEach(rec => {
      const currency = getAccountCurrency(rec.accountId);
      const val = convertToDefault(rec.amount, currency);
      
      if (isLiabilityCategory(rec.categoryId)) {
        totalLiabilities += val;
      } else {
        totalAssets += val;
      }
    });
    return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
  }, [latestRecords, defaultCurrency, accounts, categories]);

  // 3. Pie Data (Assets)
  const pieData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    latestRecords.forEach(rec => {
        if (isLiabilityCategory(rec.categoryId)) return;
        const currency = getAccountCurrency(rec.accountId);
        const val = convertToDefault(rec.amount, currency);
        
        const key = allocationBy === 'category' ? getCategoryName(rec.categoryId) : getAccountName(rec.accountId);
        dataMap[key] = (dataMap[key] || 0) + val;
    });
    return Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [latestRecords, allocationBy, defaultCurrency, accounts, categories]);

  // 4. Trend Data
  const { fullTrendData, availableYears, dataKeys } = useMemo(() => {
    if (records.length === 0) return { fullTrendData: [], availableYears: [], dataKeys: [] };

    const months = Array.from(new Set(records.map(r => r.date.substring(0, 7)))).sort();
    const years = Array.from(new Set(records.map(r => r.date.substring(0, 4)))).sort().reverse();
    const foundKeys = new Set<string>();

    const data = months.map(month => {
      const accountLatestInMonth = new Map<string, AssetRecord>();
      const relevantRecords = records.filter(r => r.date.substring(0, 7) <= month);
      
      relevantRecords.forEach(record => {
         const key = `${record.accountId}-${record.ownerId}`;
         const existing = accountLatestInMonth.get(key);
         if (!existing || record.date > existing.date || (record.date === existing.date && record.timestamp > existing.timestamp)) {
           accountLatestInMonth.set(key, record);
         }
      });

      const dataPoint: any = { name: month, NetWorth: 0 };

      Array.from(accountLatestInMonth.values()).forEach(rec => {
        const currency = getAccountCurrency(rec.accountId);
        const val = convertToDefault(rec.amount, currency);
        const isLiability = isLiabilityCategory(rec.categoryId);
        
        const key = trendAllocationBy === 'category' ? getCategoryName(rec.categoryId) : getAccountName(rec.accountId);
        foundKeys.add(key);

        if (isLiability) {
            dataPoint.NetWorth -= val;
            dataPoint[key] = (dataPoint[key] || 0) - val; 
        } else {
            dataPoint.NetWorth += val;
            dataPoint[key] = (dataPoint[key] || 0) + val;
        }
      });

      dataPoint.NetWorth = Math.round(dataPoint.NetWorth);
      foundKeys.forEach(k => {
          if (dataPoint[k]) dataPoint[k] = Math.round(dataPoint[k]);
      });

      return dataPoint;
    });

    return { fullTrendData: data, availableYears: years, dataKeys: Array.from(foundKeys) };
  }, [records, defaultCurrency, trendAllocationBy, accounts, categories]);

  const filteredTrendData = useMemo(() => {
    if (timeRange === 'all') return fullTrendData;
    if (timeRange === '12m') return fullTrendData.slice(-12);
    return fullTrendData.filter(d => d.name.startsWith(timeRange));
  }, [fullTrendData, timeRange]);

  // 5. Liability Pie Data
  const liabilityPieData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    latestRecords.forEach(rec => {
        if (!isLiabilityCategory(rec.categoryId)) return;
        const currency = getAccountCurrency(rec.accountId);
        const val = convertToDefault(rec.amount, currency);
        const name = getAccountName(rec.accountId);
        dataMap[name] = (dataMap[name] || 0) + val;
    });
    return Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [latestRecords, defaultCurrency, accounts, categories]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat(language === Language.EN ? 'en-US' : (language === Language.FR ? 'fr-FR' : 'zh-CN'), {
      style: 'currency',
      currency: defaultCurrency,
      maximumFractionDigits: 0
    }).format(Math.abs(val));
  };

  // Helper to assign colors
  const getColorForKey = (key: string, index: number) => {
    if (trendAllocationBy === 'category') {
        const cat = categories.find(c => c.name === key);
        return cat ? cat.color : '#94a3b8';
    }
    return ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
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
      
      {/* Summary Cards Mobile */}
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

      {/* Trend Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
           <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold text-slate-800">{t('dash.trend', language)}</h3>
           </div>
           <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setTrendAllocationBy('category')} className={`px-2 py-1 text-[10px] font-medium rounded-md flex items-center gap-1 transition ${trendAllocationBy === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        <PieChartIcon size={12} /> {t('dash.byCategory', language)}
                    </button>
                    <button onClick={() => setTrendAllocationBy('account')} className={`px-2 py-1 text-[10px] font-medium rounded-md flex items-center gap-1 transition ${trendAllocationBy === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        <Layers size={12} /> {t('dash.byAccount', language)}
                    </button>
                </div>
                <div className="relative">
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none">
                        <option value="12m">{t('dash.last12Months', language)}</option>
                        <option value="all">{t('dash.allTime', language)}</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <Filter size={12} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
           </div>
        </div>
        
        <div className="w-full overflow-x-auto pb-2 no-scrollbar">
            <div style={{ minWidth: '100%', width: filteredTrendData.length > 12 ? `${filteredTrendData.length * 60}px` : '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={filteredTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} stackOffset="sign">
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: number) => [formatMoney(value), '']}
                        />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                        {dataKeys.map((key, index) => (
                            <Bar key={key} dataKey={key} stackId="stack" fill={getColorForKey(key, index)} barSize={20} />
                        ))}
                        <Line type="monotone" dataKey="NetWorth" stroke="#1e293b" strokeWidth={3} dot={{r: 3, fill: '#1e293b', strokeWidth: 0}} name={t('dash.netWorth', language)} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800">{t('dash.allocation', language)}</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button onClick={() => setAllocationBy('category')} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    <PieChartIcon size={14} /> {t('dash.byCategory', language)}
                </button>
                <button onClick={() => setAllocationBy('account')} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    <Layers size={14} /> {t('dash.byAccount', language)}
                </button>
            </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={allocationBy === 'category' ? (categories.find(c => c.name === entry.name)?.color || '#ccc') : ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
