
import React, { useMemo, useState } from 'react';
import { AssetRecord, Currency, EXCHANGE_RATES, Language, Account, Category, Owner } from '../types';
import { t } from '../utils/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ComposedChart, Line, Bar, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine } from 'recharts';
import { Wallet, PieChart as PieChartIcon, Layers, Filter, CircleDollarSign, CreditCard } from 'lucide-react';

interface DashboardProps {
  records: AssetRecord[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  defaultCurrency: Currency;
  language: Language;
}

const ACCOUNT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', 
  '#ef4444', '#64748b', '#ec4899', '#84cc16', '#f97316', 
  '#6366f1', '#14b8a6', '#d946ef', '#f43f5e', '#eab308'
];

export const Dashboard: React.FC<DashboardProps> = ({ records, accounts, categories, owners, defaultCurrency, language }) => {
  const [allocationBy, setAllocationBy] = useState<'category' | 'account'>('category');
  const [allocationType, setAllocationType] = useState<'ASSET' | 'LIABILITY'>('ASSET');
  const [trendAllocationBy, setTrendAllocationBy] = useState<'category' | 'account'>('category');
  const [timeRange, setTimeRange] = useState<string>('12m'); 
  
  // Helpers
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id;
  const getAccountCurrency = (id: string) => accounts.find(a => a.id === id)?.currency || defaultCurrency;
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';
  const isLiabilityCategory = (id: string) => {
      const cat = categories.find(c => c.id === id);
      return cat?.type === 'LIABILITY';
  };

  // Helper to convert any amount to default currency
  const convertToDefault = (amount: number, currency: Currency): number => {
    if (currency === defaultCurrency) return amount;
    const amountInUSD = amount * EXCHANGE_RATES[currency];
    const rateDefaultToUSD = EXCHANGE_RATES[defaultCurrency];
    return amountInUSD / rateDefaultToUSD;
  };

  // 1. Calculate Snapshot for Pie Chart
  const latestRecords = useMemo(() => {
    const latestRecordsMap = new Map<string, AssetRecord>();
    records.forEach(record => {
      const key = `${record.accountId}-${record.categoryId}-${record.ownerId}`; 
      const existing = latestRecordsMap.get(key);
      if (!existing || record.date > existing.date || (record.date === existing.date && record.timestamp > existing.timestamp)) {
        latestRecordsMap.set(key, record);
      }
    });
    return Array.from(latestRecordsMap.values());
  }, [records]);

  // 2. Pie Data Logic
  const pieData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    latestRecords.forEach(rec => {
        const isLiability = isLiabilityCategory(rec.categoryId);
        
        // Filter based on selected Allocation Type (Asset vs Liability)
        if (allocationType === 'ASSET' && isLiability) return;
        if (allocationType === 'LIABILITY' && !isLiability) return;
        
        const currency = getAccountCurrency(rec.accountId);
        const val = convertToDefault(rec.amount, currency);
        
        // Grouping Key
        const key = allocationBy === 'category' ? getCategoryName(rec.categoryId) : getAccountName(rec.accountId);
        dataMap[key] = (dataMap[key] || 0) + val;
    });

    // Filter out values that are 0 or extremely close to 0 (floating point safety)
    return Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    })).filter(d => d.value > 0.01).sort((a, b) => b.value - a.value);
  }, [latestRecords, allocationBy, allocationType, defaultCurrency, accounts, categories]);

  // 3. Trend Data Logic
  const { fullTrendData, availableYears, dataKeys } = useMemo(() => {
    if (records.length === 0) return { fullTrendData: [], availableYears: [], dataKeys: [] };

    const months = Array.from(new Set(records.map(r => r.date.substring(0, 7)))).sort();
    const years = Array.from(new Set(records.map(r => r.date.substring(0, 4)))).sort().reverse();
    
    // We use IDs as data keys to ensure uniqueness
    const foundIds = new Set<string>();

    const data = months.map(month => {
      const latestInMonthMap = new Map<string, AssetRecord>();
      
      const relevantRecords = records.filter(r => r.date.substring(0, 7) <= month);
      
      relevantRecords.forEach(record => {
         const key = `${record.accountId}-${record.categoryId}-${record.ownerId}`;
         const existing = latestInMonthMap.get(key);
         if (!existing || record.date > existing.date || (record.date === existing.date && record.timestamp > existing.timestamp)) {
           latestInMonthMap.set(key, record);
         }
      });

      const dataPoint: any = { name: month, NetWorth: 0 };

      Array.from(latestInMonthMap.values()).forEach(rec => {
        const currency = getAccountCurrency(rec.accountId);
        let val = convertToDefault(rec.amount, currency);
        
        // Ensure 0 remains 0 strictly to avoid ghost bars
        if (val < 0.01) val = 0;

        const isLiability = isLiabilityCategory(rec.categoryId);
        
        // Determine Group ID (Category ID or Account ID)
        const idKey = trendAllocationBy === 'category' ? rec.categoryId : rec.accountId;
        
        // Only add to foundIds if value is non-zero (so it appears in legend at least once if it ever had value)
        // OR we can add it regardless, but the bar will be 0 height. 
        // Recharts handles 0 height bars by hiding them.
        foundIds.add(idKey);

        if (isLiability) {
            // Negative for Net Worth calc
            dataPoint.NetWorth -= val;
            // Negative for Chart Bar display
            val = -val; 
        } else {
            dataPoint.NetWorth += val;
        }

        // Accumulate value for this ID (in case multiple records map to same category/account)
        // If val is 0, this adds 0.
        dataPoint[idKey] = (dataPoint[idKey] || 0) + val;
      });

      // Rounding
      dataPoint.NetWorth = Math.round(dataPoint.NetWorth);
      foundIds.forEach(k => {
          if (dataPoint[k]) dataPoint[k] = Math.round(dataPoint[k]);
      });

      return dataPoint;
    });

    return { fullTrendData: data, availableYears: years, dataKeys: Array.from(foundIds) };
  }, [records, defaultCurrency, trendAllocationBy, accounts, categories]);

  const filteredTrendData = useMemo(() => {
    if (timeRange === 'all') return fullTrendData;
    if (timeRange === '12m') return fullTrendData.slice(-12);
    return fullTrendData.filter(d => d.name.startsWith(timeRange));
  }, [fullTrendData, timeRange]);

  // Formatter
  const formatMoney = (val: number) => {
    // Allows negative values to show with minus sign
    return new Intl.NumberFormat(language === Language.EN ? 'en-US' : (language === Language.FR ? 'fr-FR' : 'zh-CN'), {
      style: 'currency',
      currency: defaultCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getColorForId = (id: string, index: number) => {
    if (trendAllocationBy === 'category') {
        return getCategoryColor(id);
    }
    return ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
  };

  const getNameForId = (id: string) => {
      return trendAllocationBy === 'category' ? getCategoryName(id) : getAccountName(id);
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
      
      {/* Trend Chart (Bar + Line) */}
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
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <ComposedChart data={filteredTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} stackOffset="sign">
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                            itemStyle={{padding: 0}}
                            formatter={(value: number, name: string, props: any) => {
                                // Don't show tooltip item if value is 0
                                if (Math.abs(value) < 0.01) return [undefined, undefined];
                                return [formatMoney(value), getNameForId(props.dataKey)];
                            }}
                            labelStyle={{marginBottom: '8px', color: '#64748b', fontSize: '10px', fontWeight: 'bold'}}
                            // Sort tooltip items: Positives descending, then Negatives descending (algebraically)
                            // This puts largest positive at top, and largest negative (absolute) at bottom
                            itemSorter={(item) => (item.value as number) * -1}
                        />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                        {dataKeys.map((keyId, index) => (
                            <Bar 
                                key={keyId} 
                                dataKey={keyId}
                                name={getNameForId(keyId)} 
                                stackId="stack" 
                                fill={getColorForId(keyId, index)} 
                                barSize={20} 
                            />
                        ))}
                        <Line type="monotone" dataKey="NetWorth" stroke="#1e293b" strokeWidth={3} dot={{r: 3, fill: '#1e293b', strokeWidth: 0}} name={t('dash.netWorth', language)} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Allocation Pie Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">{t('dash.allocation', language)}</h3>
                
                {/* Toggle Assets / Liabilities */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setAllocationType('ASSET')} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 transition ${allocationType === 'ASSET' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        <CircleDollarSign size={14} /> {t('dash.assets', language)}
                    </button>
                    <button 
                        onClick={() => setAllocationType('LIABILITY')} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 transition ${allocationType === 'LIABILITY' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        <CreditCard size={14} /> {t('dash.liabilitiesDist', language)}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Group By:</span>
                 <div className="flex bg-slate-50 border border-slate-100 p-0.5 rounded-lg">
                    <button onClick={() => setAllocationBy('category')} className={`px-2 py-1 text-[10px] font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'category' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>
                        <PieChartIcon size={12} /> {t('dash.byCategory', language)}
                    </button>
                    <button onClick={() => setAllocationBy('account')} className={`px-2 py-1 text-[10px] font-medium rounded-md flex items-center gap-1 transition ${allocationBy === 'account' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>
                        <Layers size={12} /> {t('dash.byAccount', language)}
                    </button>
                </div>
            </div>
        </div>

        <div className="h-72 w-full relative">
            {pieData.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                     <div className="p-4 bg-slate-50 rounded-full mb-2">
                        {allocationType === 'ASSET' ? <CircleDollarSign size={32} /> : <CreditCard size={32} />}
                     </div>
                     <p className="text-sm font-medium">No active {allocationType === 'ASSET' ? 'assets' : 'liabilities'} (> 0).</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                    <Pie 
                        data={pieData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={2} 
                        dataKey="value" 
                        nameKey="name"
                    >
                        {pieData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={allocationBy === 'category' 
                                ? (categories.find(c => c.name === entry.name)?.color || '#ccc') 
                                : ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]
                            } 
                        />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
};
