
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AssetRecord, Account, Category, Owner, Language } from '../types';
import { Plus, ChevronDown, ChevronUp, Calendar, Edit, Trash2 } from 'lucide-react';
import { t } from '../utils/translations';
import * as api from '../services/api';

interface AccountsTabProps {
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  onAddRecord: (accountId: string) => void;
  onEditRecord: (record: AssetRecord) => void;
  onDeleteRecord: (id: string) => void;
  isDemoMode: boolean;
  language: Language;
  recordRefreshKey: number;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts, categories, owners,
  onAddRecord, onEditRecord, onDeleteRecord,
  isDemoMode, language, recordRefreshKey,
}) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [accountRecords, setAccountRecords] = useState<Record<string, AssetRecord[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const fetchForAccount = useCallback(async (accountId: string) => {
    setLoadingIds(prev => new Set(prev).add(accountId));
    try {
      const records = await api.fetchRecords({ accountId });
      records.sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.timestamp - a.timestamp;
      });
      setAccountRecords(prev => ({ ...prev, [accountId]: records }));
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(accountId); return s; });
    }
  }, []);

  // When recordRefreshKey changes, re-fetch all currently-expanded accounts
  useEffect(() => {
    if (recordRefreshKey === 0) return;
    for (const accountId of expandedAccounts) {
      fetchForAccount(accountId);
    }
  }, [recordRefreshKey]);

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
        if (!accountRecords[accountId]) {
          fetchForAccount(accountId);
        }
      }
      return next;
    });
  };

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      const ownerA = owners.find(o => o.id === a.ownerId)?.name ?? '';
      const ownerB = owners.find(o => o.id === b.ownerId)?.name ?? '';
      if (ownerA !== ownerB) return ownerA.localeCompare(ownerB);
      return a.name.localeCompare(b.name);
    });
  }, [accounts, owners]);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-sm">{t('account.noAccounts', language)}</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-3">
      {sortedAccounts.map(account => {
        const category = categories.find(c => c.id === account.categoryId);
        const owner = owners.find(o => o.id === account.ownerId);
        const isExpanded = expandedAccounts.has(account.id);
        const isLiability = category?.type === 'LIABILITY';
        const records = accountRecords[account.id] || [];
        const isLoading = loadingIds.has(account.id);

        return (
          <div key={account.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Account Card */}
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                {/* Left: name + tags */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-base leading-tight">{account.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {owner && (
                      <span className="text-xs text-slate-500 font-medium">{owner.name}</span>
                    )}
                    {owner && category && (
                      <span className="text-slate-200">·</span>
                    )}
                    {category && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLiability
                        ? 'bg-red-100 text-red-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isLiability ? t('type.liability', language) : t('type.asset', language)}
                    </span>
                  </div>
                </div>

                {/* Right: balance + actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right mr-1">
                    {account.latestAmount !== undefined ? (
                      <>
                        <div className={`font-bold text-base ${isLiability ? 'text-red-500' : 'text-slate-800'}`}>
                          {account.latestAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">{account.currency}</div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-300 italic">{t('account.noRecords', language)}</div>
                    )}
                  </div>

                  {/* Add record */}
                  <button
                    onClick={() => onAddRecord(account.id)}
                    disabled={isDemoMode}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      isDemoMode
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95'
                    }`}
                    title="Add record"
                  >
                    <Plus size={16} />
                  </button>

                  {/* Toggle history */}
                  <button
                    onClick={() => toggleExpand(account.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded records */}
            {isExpanded && (
              <div className="border-t border-slate-100">
                {isLoading ? (
                  <div className="px-4 py-5 text-center text-sm text-slate-400">{t('account.loading', language) || '…'}</div>
                ) : records.length === 0 ? (
                  <div className="px-4 py-5 text-center text-sm text-slate-400 italic">
                    {t('account.noRecordsYet', language)}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {records.map(record => (
                      <div key={record.id} className="px-4 py-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar size={12} className="text-slate-300 flex-shrink-0" />
                            <span>{record.date}</span>
                          </div>
                          {record.note && (
                            <div className="text-xs text-slate-400 mt-0.5 italic truncate">{record.note}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <span className={`font-semibold text-sm ${isLiability ? 'text-red-500' : 'text-slate-700'}`}>
                            {record.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 ml-0.5 mr-2">{account.currency}</span>
                          <button
                            onClick={() => onEditRecord(record)}
                            disabled={isDemoMode}
                            className={`p-1.5 rounded-full transition ${
                              isDemoMode ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (isDemoMode) return;
                              if (confirm(t('account.deleteRecord', language))) onDeleteRecord(record.id);
                            }}
                            disabled={isDemoMode}
                            className={`p-1.5 rounded-full transition ${
                              isDemoMode ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
