import React, { useState, useEffect } from 'react';
import { AssetRecord, Account, Owner, Category, Language } from '../types';
import { Save, Lock } from 'lucide-react';
import { t } from '../utils/translations';

interface EntryFormProps {
  accounts: Account[];
  owners: Owner[];
  categories: Category[];
  onSave: (record: AssetRecord) => void;
  isDemoMode: boolean;
  language: Language;
  initialRecord?: AssetRecord | null;
}

export const EntryForm: React.FC<EntryFormProps> = ({ accounts, owners, categories, onSave, isDemoMode, language, initialRecord }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [ownerId, setOwnerId] = useState(owners[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Update state when initialRecord changes
  useEffect(() => {
    if (initialRecord) {
        setDate(initialRecord.date);
        setAccountId(initialRecord.accountId);
        setOwnerId(initialRecord.ownerId);
        setCategoryId(initialRecord.categoryId);
        setAmount(initialRecord.amount.toString());
        setNote(initialRecord.note || '');
    } else {
        // Reset defaults if no record provided (new entry mode)
        setDate(new Date().toISOString().split('T')[0]);
        setAccountId(accounts[0]?.id || '');
        setOwnerId(owners[0]?.id || '');
        setCategoryId(categories[0]?.id || '');
        setAmount('');
        setNote('');
    }
  }, [initialRecord, accounts, owners, categories]);

  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
        alert(t('entry.alertDemo', language));
        return;
    }

    if (!accountId || !ownerId || !categoryId) {
        alert("Please create at least one Account, Owner, and Category first.");
        return;
    }

    const newRecord: AssetRecord = {
      id: initialRecord?.id || crypto.randomUUID(), // Keep ID if editing, else new UUID
      date,
      accountId,
      ownerId,
      categoryId,
      amount: parseFloat(amount),
      note,
      timestamp: initialRecord?.timestamp || Date.now() // Keep timestamp if editing
    };

    onSave(newRecord);
    
    if (!initialRecord) {
        setAmount('');
        setNote('');
        alert(t('entry.alertSaved', language));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
      {isDemoMode && (
        <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
          {t('entry.demoBanner', language)}
        </div>
      )}
      
      <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">
          {initialRecord ? 'Edit Record' : t('entry.title', language)}
      </h2>
      
      <form onSubmit={handleSubmit} className={`space-y-5 ${isDemoMode ? 'opacity-60' : ''}`}>
        
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.date', language)}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isDemoMode}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50"
          />
        </div>

        {/* Account Select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.account', language)}</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isDemoMode || accounts.length === 0}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
          >
             {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
          {accounts.length === 0 && <p className="text-xs text-red-500 mt-1">No accounts found. Please add one.</p>}
        </div>

        {/* Owner Select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.owner', language)}</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            disabled={isDemoMode || owners.length === 0}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
          >
             {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        {/* Amount (Currency Display only) */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.amount', language)}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {selectedAccount?.currency || '$'}
                </span>
                <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={isDemoMode}
                className="w-full p-3 pl-12 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                />
            </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.category', language)}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isDemoMode || categories.length === 0}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.note', language)}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={isDemoMode}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50"
            placeholder={t('entry.notePlaceholder', language)}
          />
        </div>

        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
            {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
            {isDemoMode ? t('entry.demo', language) : (initialRecord ? 'Update Record' : t('entry.save', language))}
        </button>

      </form>
    </div>
  );
};