
import React, { useState, useMemo } from 'react';
import { AssetRecord, AssetCategory, Currency, Language } from '../types';
import { Save, Lock } from 'lucide-react';
import { t, CATEGORY_LABELS, getCurrencyLabel } from '../utils/translations';

interface EntryFormProps {
  records: AssetRecord[];
  onSave: (record: AssetRecord) => void;
  defaultCurrency: Currency;
  isDemoMode: boolean;
  language: Language;
}

export const EntryForm: React.FC<EntryFormProps> = ({ records, onSave, defaultCurrency, isDemoMode, language }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountName, setAccountName] = useState('');
  const [owner, setOwner] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [category, setCategory] = useState<AssetCategory>(AssetCategory.CASH);
  const [note, setNote] = useState('');

  // Derived autocomplete lists
  const accountSuggestions = useMemo(() => Array.from(new Set(records.map(r => r.accountName))), [records]);
  const ownerSuggestions = useMemo(() => Array.from(new Set(records.map(r => r.owner))), [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
        alert(t('entry.alertDemo', language));
        return;
    }

    const newRecord: AssetRecord = {
      id: crypto.randomUUID(),
      date,
      accountName,
      owner,
      currency,
      amount: parseFloat(amount),
      category,
      note,
      timestamp: Date.now()
    };

    onSave(newRecord);
    
    // Reset some fields but keep logical defaults for rapid entry
    setAmount('');
    setNote('');
    alert(t('entry.alertSaved', language));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
      {isDemoMode && (
        <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
          {t('entry.demoBanner', language)}
        </div>
      )}
      
      <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{t('entry.title', language)}</h2>
      
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
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Account Name with Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.account', language)}</label>
          <input
            type="text"
            list="account-suggestions"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder={t('entry.accountPlaceholder', language)}
            required
            disabled={isDemoMode}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <datalist id="account-suggestions">
            {accountSuggestions.map(name => <option key={name} value={name} />)}
          </datalist>
        </div>

        {/* Owner */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.owner', language)}</label>
          <input
            type="text"
            list="owner-suggestions"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder={t('entry.ownerPlaceholder', language)}
            required
            disabled={isDemoMode}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <datalist id="owner-suggestions">
            {ownerSuggestions.map(name => <option key={name} value={name} />)}
          </datalist>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.currency', language)}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              disabled={isDemoMode}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
               {Object.values(Currency).sort().map(c => (
                 <option key={c} value={c}>{getCurrencyLabel(c, language)}</option>
               ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.amount', language)}</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isDemoMode}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.category', language)}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory)}
            disabled={isDemoMode}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            {Object.values(AssetCategory).map(cat => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[language][cat]}</option>
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
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            placeholder={t('entry.notePlaceholder', language)}
          />
        </div>

        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
            {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
            {isDemoMode ? t('entry.demo', language) : t('entry.save', language)}
        </button>

      </form>
    </div>
  );
};
