
import React, { useRef } from 'react';
import { Currency, AssetRecord, Language, Account, Category, Owner, FullBackup } from '../types';
import { Download, Upload, FileText, FileJson, Trash2, Globe, Wallet, User, Tag, ChevronRight, AlertTriangle, Image } from 'lucide-react';
import { validateImportData } from '../utils/dataHelpers';
import { t, getCurrencyLabel } from '../utils/translations';
import * as api from '../services/api';

interface SettingsProps {
  defaultCurrency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  records: AssetRecord[];
  onImportData: (data: FullBackup) => void;
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  onNavigate: (view: string) => void;
  onDeleteAllData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  defaultCurrency,
  setCurrency,
  language,
  setLanguage,
  logoUrl,
  setLogoUrl,
  records,
  onImportData,
  accounts,
  categories,
  owners,
  onNavigate,
  onDeleteAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = async () => {
    try {
      await api.downloadCsv();
    } catch (err: any) {
      alert(err.message ?? 'CSV export failed');
    }
  };

  const handleBackupJSON = async () => {
    try {
      const backup = await api.fetchBackup();
      const jsonContent = JSON.stringify(backup, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fat_full_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message ?? 'Backup failed');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        const validBackup = validateImportData(parsedData);

        if (validBackup) {
          const recordCount = validBackup.records.length;
          const accountCount = validBackup.accounts.length;
          if (confirm(t('settings.restoreConfirm', language, [recordCount + ' records & ' + accountCount + ' accounts']))) {
            await onImportData(validBackup);
            alert(t('settings.restoreSuccess', language));
          }
        } else {
          alert(t('settings.restoreError', language));
        }
      } catch (err) {
        alert(t('settings.parseError', language));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-8 pb-24">

      {/* Management Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings.manage', language)}</h2>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => onNavigate('manage_owners')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm"><User size={20} /></div>
              <span className="font-medium text-slate-700">{t('settings.owners', language)}</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          <button onClick={() => onNavigate('manage_categories')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm"><Tag size={20} /></div>
              <span className="font-medium text-slate-700">{t('settings.categories', language)}</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          <button onClick={() => onNavigate('manage_accounts')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Wallet size={20} /></div>
              <span className="font-medium text-slate-700">{t('settings.accounts', language)}</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings.prefs', language)}</h2>
        <div className="space-y-6">

          <label className="block">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Globe size={16} />
              <span>{t('settings.language', language)}</span>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white text-slate-900">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="zh">简体中文</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t('settings.defaultCurrency', language)}</span>
            <select value={defaultCurrency} onChange={(e) => setCurrency(e.target.value as Currency)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white text-slate-900">
              {Object.values(Currency).sort().map(code => (
                <option key={code} value={code}>{getCurrencyLabel(code, language)}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">{t('settings.currencyDesc', language)}</p>
          </label>

          {/* Logo */}
          <div>
            <span className="text-sm font-medium text-slate-700 block mb-2">App Logo</span>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              )}
              <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              <button onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition">
                <Image size={16} />
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <button onClick={() => setLogoUrl(null)}
                  className="text-sm text-red-500 hover:text-red-700 transition">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('settings.data', language)}</h2>
        <div className="grid grid-cols-1 gap-4">

          <button onClick={handleExportCSV}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm group-hover:text-emerald-700"><FileText size={20} /></div>
              <div>
                <div className="font-bold text-slate-800">{t('settings.export', language)}</div>
                <div className="text-xs text-slate-500">{t('settings.exportDesc', language)}</div>
              </div>
            </div>
            <Download size={18} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <button onClick={handleBackupJSON}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:text-blue-700"><FileJson size={20} /></div>
              <div>
                <div className="font-bold text-slate-800">{t('settings.backup', language)}</div>
                <div className="text-xs text-slate-500">{t('settings.backupDesc', language)}</div>
              </div>
            </div>
            <Download size={18} className="text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="relative">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-left group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm group-hover:text-amber-700"><Upload size={20} /></div>
                <div>
                  <div className="font-bold text-slate-800">{t('settings.restore', language)}</div>
                  <div className="text-xs text-slate-500">{t('settings.restoreDesc', language)}</div>
                </div>
              </div>
              <Upload size={18} className="text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          <button onClick={onDeleteAllData}
            className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition text-left group mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm"><AlertTriangle size={20} /></div>
              <div>
                <div className="font-bold text-red-700">{t('settings.deleteAll', language)}</div>
                <div className="text-xs text-red-500">{t('settings.deleteAllDesc', language)}</div>
              </div>
            </div>
            <Trash2 size={18} className="text-red-400 group-hover:text-red-600" />
          </button>

        </div>
      </div>

    </div>
  );
};
