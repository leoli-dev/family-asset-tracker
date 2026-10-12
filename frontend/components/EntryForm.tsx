
import React, { useState, useEffect, useRef } from 'react';
import { AssetRecord, Account, Owner, Category, Language } from '../types';
import { Save, Lock } from 'lucide-react';
import { t } from '../utils/translations';
import { createId } from '../utils/uuid';

// toISOString() is UTC, which rolls over to tomorrow in the evening for
// timezones west of UTC — use the local calendar date instead.
const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface EntryFormProps {
  accounts: Account[];
  owners: Owner[];
  categories: Category[];
  onSave: (record: AssetRecord) => Promise<void> | void;
  isDemoMode: boolean;
  language: Language;
  initialRecord?: AssetRecord | null;
  lockedAccountId?: string | null;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  accounts, owners, categories, onSave, isDemoMode, language, initialRecord, lockedAccountId,
}) => {
  const [date, setDate] = useState(todayLocal());
  const [accountId, setAccountId] = useState(lockedAccountId || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  // Stable across retries of the same entry, so a save whose outcome was
  // uncertain can be resent without inserting a duplicate record.
  const recordIdRef = useRef(initialRecord?.id || createId());

  // Reset the draft only when the entry/edit target changes — not when the
  // accounts list is refreshed (e.g. a previous save's refresh landing late),
  // which would otherwise wipe what the user is typing and its retry id.
  useEffect(() => {
    recordIdRef.current = initialRecord?.id || createId();
    if (initialRecord) {
      setDate(initialRecord.date);
      setAccountId(initialRecord.accountId);
      setAmount(initialRecord.amount.toString());
      setNote(initialRecord.note || '');
    } else {
      setDate(todayLocal());
      setAccountId(lockedAccountId || accounts[0]?.id || '');
      setAmount('');
      setNote('');
    }
  }, [initialRecord, lockedAccountId]);

  // When accounts change, only fix up the selection if it no longer points at one.
  useEffect(() => {
    if (lockedAccountId || initialRecord) return;
    if (!accounts.some(a => a.id === accountId)) setAccountId(accounts[0]?.id || '');
  }, [accounts]);

  const selectedAccount = accounts.find(a => a.id === accountId);
  const selectedAccountCategory = selectedAccount ? categories.find(c => c.id === selectedAccount.categoryId) : null;
  const selectedOwner = owners.find(o => o.id === selectedAccount?.ownerId);
  const isAccountLocked = !!lockedAccountId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (isDemoMode) {
      alert(t('entry.alertDemo', language));
      return;
    }

    if (!accountId) {
      alert(t('entry.noAccount', language));
      return;
    }

    const newRecord: AssetRecord = {
      id: recordIdRef.current,
      date,
      accountId,
      amount: parseFloat(amount),
      note,
      timestamp: initialRecord?.timestamp || Date.now(),
    };

    setSaving(true);
    try {
      await onSave(newRecord);
    } catch (err: any) {
      alert(err?.message ?? String(err));
      return;
    } finally {
      setSaving(false);
    }

    if (!initialRecord) {
      recordIdRef.current = createId();
      setAmount('');
      setNote('');
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
        {initialRecord ? t('entry.editTitle', language) : t('entry.title', language)}
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

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.account', language)}</label>

          {isAccountLocked ? (
            <div className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium">
              {selectedAccount?.name || '—'}
            </div>
          ) : (
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isDemoMode || accounts.length === 0}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
            >
              {accounts.map(acc => {
                const owner = owners.find(o => o.id === acc.ownerId);
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}{owner ? ` (${owner.name})` : ''}
                  </option>
                );
              })}
            </select>
          )}

          {accounts.length === 0 && (
            <p className="text-xs text-red-500 mt-1">{t('entry.noAccountFound', language)}</p>
          )}

          <div className="space-y-1 mt-1 ml-1 text-xs text-slate-400">
            {selectedAccountCategory && (
              <p>{t('entry.category', language)}: <span className="font-bold" style={{ color: selectedAccountCategory.color }}>{selectedAccountCategory.name}</span></p>
            )}
            {selectedOwner && (
              <p>{t('entry.owner', language)}: <span className="font-bold text-slate-600">{selectedOwner.name}</span></p>
            )}
          </div>
        </div>

        {/* Amount */}
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
              onWheel={(e) => {
                e.preventDefault();
                e.currentTarget.blur();
              }}
              placeholder="0.00"
              required
              disabled={isDemoMode}
              className="w-full p-3 pl-12 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
            />
          </div>
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
          disabled={saving}
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${
            isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
          {isDemoMode ? t('entry.demo', language) : saving ? t('common.saving', language) : (initialRecord ? t('entry.update', language) : t('entry.save', language))}
        </button>

      </form>
    </div>
  );
};
