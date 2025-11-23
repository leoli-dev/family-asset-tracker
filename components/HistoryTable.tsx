
import React, { useState, useMemo, useEffect } from 'react';
import { AssetRecord, Account, Category, Owner, Language } from '../types';
import { Trash2, ChevronLeft, ChevronRight, Calendar, User, Filter, X } from 'lucide-react';
import { t } from '../utils/translations';

interface HistoryTableProps {
  records: AssetRecord[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  onDelete: (id: string) => void;
  onUpdate: (record: AssetRecord) => void; 
  isDemoMode: boolean;
  language: Language;
}

const ITEMS_PER_PAGE = 10;

export const HistoryTable: React.FC<HistoryTableProps> = ({ records, accounts, categories, owners, onDelete, isDemoMode, language }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAccount, setFilterAccount] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

  // Helper lookups
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id;
  const getAccountCurrency = (id: string) => accounts.find(a => a.id === id)?.currency || '';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';
  const isLiability = (id: string) => categories.find(c => c.id === id)?.type === 'LIABILITY';
  const getOwnerName = (id: string) => owners.find(o => o.id === id)?.name || id;

  const sortedRecords = useMemo(() => {
      return [...records].sort((a, b) => {
          if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
          return b.timestamp - a.timestamp;
      });
  }, [records]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(record => {
        const matchesAccount = filterAccount ? record.accountId === filterAccount : true;
        const matchesCategory = filterCategory ? record.categoryId === filterCategory : true;
        const matchesOwner = filterOwner ? record.ownerId === filterOwner : true;
        return matchesAccount && matchesCategory && matchesOwner;
    });
  }, [sortedRecords, filterAccount, filterCategory, filterOwner]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAccount, filterCategory, filterOwner]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id: string) => {
    if (isDemoMode) {
        alert(t('history.demoDelete', language));
        return;
    }
    if (confirm(t('history.deleteConfirm', language))) {
      onDelete(id);
    }
  };

  const clearFilters = () => {
    setFilterAccount('');
    setFilterCategory('');
    setFilterOwner('');
  };

  if (records.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center py-16 text-slate-400">
         <Calendar size={48} className="mb-4 opacity-20" />
         <p>{t('history.noRecords', language)}</p>
       </div>
     );
  }

  return (
    <div className="pb-24 space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Filter size={18} className="text-blue-600" />
                <span>{t('history.filter', language)}</span>
            </div>
            {(filterAccount || filterCategory || filterOwner) && (
                <button 
                    onClick={clearFilters}
                    className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 transition"
                >
                    <X size={12} /> {t('history.clear', language)}
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
                <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none">
                    <option value="">{t('history.allAccounts', language)}</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none">
                    <option value="">{t('history.allOwners', language)}</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none">
                <option value="">{t('history.allCategories', language)}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
            <p>{t('history.noMatch', language)}</p>
        </div>
      )}

      <div className="space-y-3">
        {paginatedRecords.map((record) => {
            const accName = getAccountName(record.accountId);
            const catName = getCategoryName(record.categoryId);
            const ownerName = getOwnerName(record.ownerId);
            const currency = getAccountCurrency(record.accountId);
            const color = getCategoryColor(record.categoryId);
            const isLiab = isLiability(record.categoryId);

            return (
                <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 relative">
                    <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-slate-800 text-lg leading-tight">{accName}</div>
                        {record.note && <div className="text-xs text-slate-400 mt-1 italic line-clamp-1">{record.note}</div>}
                    </div>
                    <div className="text-right">
                        <div className={`font-bold text-lg ${isLiab ? 'text-red-500' : 'text-slate-800'}`}>
                        {record.amount.toLocaleString()} 
                        </div>
                        <div className="text-xs font-bold text-slate-400">{currency}</div>
                    </div>
                    </div>
                    <div className="h-px bg-slate-50 w-full"></div>
                    <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Calendar size={12} /><span>{record.date}</span></div>
                        <div className="flex items-center gap-1"><User size={12} /><span>{ownerName}</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: color }}>
                            {catName}
                        </span>
                        <button onClick={() => handleDelete(record.id)} className={`p-2 -mr-2 rounded-full transition ${isDemoMode ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                    </div>
                </div>
            );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 mt-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-500">{t('history.page', language)} {currentPage} {t('history.of', language)} {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );
};
