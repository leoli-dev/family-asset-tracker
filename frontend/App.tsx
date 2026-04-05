
import React, { useState, useEffect } from 'react';
import { AssetRecord, Currency, Language, Account, Category, Owner, AssetType, FullBackup } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { AccountsTab } from './components/AccountsTab';
import { Settings } from './components/Settings';
import { Nav } from './components/Nav';
import { ManagementList } from './components/ManagementList';
import { LoginPage } from './components/LoginPage';
import { PiggyBank, Save, X, Lock, Wallet, User, Tag, Check, Palette } from 'lucide-react';
import { t, getCurrencyLabel } from './utils/translations';
import * as api from './services/api';

// Expanded Palette
const PRESET_COLORS = [
  '#ef4444', '#dc2626', '#f97316', '#ea580c', '#f59e0b', '#d97706',
  '#eab308', '#ca8a04', '#84cc16', '#65a30d', '#10b981', '#059669',
  '#14b8a6', '#0d9488', '#06b6d4', '#0891b2', '#3b82f6', '#2563eb',
  '#6366f1', '#4f46e5', '#8b5cf6', '#7c3aed', '#a855f7', '#9333ea',
  '#d946ef', '#c026d3', '#ec4899', '#db2777', '#f43f5e', '#e11d48',
  '#64748b', '#475569',
];

// ---------- Entity forms (unchanged UI, just type-checked) ----------

const AccountForm = ({ onSave, language, initialData, categories, owners }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    const [curr, setCurr] = useState<Currency>(initialData?.currency || Currency.USD);
    const [catId, setCatId] = useState(initialData?.categoryId || categories[0]?.id || '');
    const [ownerId, setOwnerId] = useState(initialData?.ownerId || owners[0]?.id || '');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{initialData ? t('manage.edit', language) : t('nav.newAccount', language)}</h2>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                    <input className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                        placeholder="e.g., Chase Checking" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.category', language)}</label>
                    <select className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={catId} onChange={e => setCatId(e.target.value)}>
                        {categories.map((c: Category) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.owner', language)}</label>
                    <select className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={ownerId} onChange={e => setOwnerId(e.target.value)}>
                        {owners.map((o: Owner) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={curr} onChange={e => setCurr(e.target.value as Currency)}>
                        {Object.values(Currency).sort().map(c => <option key={c} value={c}>{getCurrencyLabel(c, language)}</option>)}
                    </select>
                </div>
                <button onClick={() => onSave({ id: initialData?.id || crypto.randomUUID(), name, currency: curr, categoryId: catId, ownerId })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save size={20} />
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

const OwnerForm = ({ onSave, language, initialData }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{initialData ? t('manage.edit', language) : t('nav.newOwner', language)}</h2>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                    <input className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
                        placeholder="e.g., Alice" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <button onClick={() => onSave({ id: initialData?.id || crypto.randomUUID(), name })}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save size={20} />
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

const CategoryForm = ({ onSave, language, initialData }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<AssetType>(initialData?.type || 'ASSET');
    const [color, setColor] = useState(initialData?.color || PRESET_COLORS[10]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{initialData ? t('manage.edit', language) : t('nav.newCategory', language)}</h2>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                    <input className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition bg-white"
                        placeholder="e.g., Gold" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <div className="flex gap-3">
                        <button onClick={() => setType('ASSET')}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${type === 'ASSET' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                            Asset
                        </button>
                        <button onClick={() => setType('LIABILITY')}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${type === 'LIABILITY' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                            Liability
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('form.color', language)}</label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex flex-wrap gap-3 justify-between mb-4">
                            <div className="w-full text-xs text-slate-400 font-bold uppercase mb-2">Select Color</div>
                            <label className="relative cursor-pointer w-10 h-10 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition group shadow-sm">
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                <Palette size={18} className="text-slate-400 group-hover:text-blue-500" />
                            </label>
                            {!PRESET_COLORS.includes(color) && (
                                <div className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-blue-500 shadow-md flex items-center justify-center" style={{ backgroundColor: color }}>
                                    <Check size={16} className="text-white drop-shadow-md" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                            {PRESET_COLORS.map(c => (
                                <button key={c} onClick={() => setColor(c)}
                                    className={`w-full aspect-square rounded-full flex items-center justify-center transition hover:scale-110 shadow-sm ${color === c ? 'ring-2 ring-offset-2 ring-slate-500 scale-110 shadow-md' : 'hover:shadow-md'}`}
                                    style={{ backgroundColor: c }}>
                                    {color === c && <Check size={16} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => onSave({ id: initialData?.id || crypto.randomUUID(), name, type, color })}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save size={20} />
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

// ---------- Main App ----------

const App: React.FC = () => {
  // Auth
  const [authed, setAuthed] = useState<boolean>(() => !!api.getToken());

  // Navigation Stack
  const [viewStack, setViewStack] = useState<string[]>(['dashboard']);
  const currentView = viewStack[viewStack.length - 1];

  // Data State
  const [records, setRecords] = useState<AssetRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  // Edit State
  const [editingRecord, setEditingRecord] = useState<AssetRecord | null>(null);
  const [preselectedAccountId, setPreselectedAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Settings
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(Currency.CAD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [loading, setLoading] = useState(true);

  // ---------- Init: load all data from API ----------

  useEffect(() => {
    if (!authed) { setLoading(false); return; }
    Promise.all([
      api.fetchSettings(),
      api.fetchOwners(),
      api.fetchCategories(),
      api.fetchAccounts(),
      api.fetchRecords(),
    ]).then(([settings, ownersData, catsData, accsData, recsData]) => {
      if (settings.defaultCurrency) setDefaultCurrency(settings.defaultCurrency as Currency);
      if (settings.language) setLanguage(settings.language as Language);
      setOwners(ownersData);
      setCategories(catsData);
      setAccounts(accsData);
      setRecords(recsData);
    }).catch(() => {
      // 401 is handled inside api.request (redirects to /login)
    }).finally(() => setLoading(false));
  }, [authed]);

  // ---------- Navigation ----------

  const pushView = (view: string) => {
    if (currentView !== view) setViewStack(prev => [...prev, view]);
  };

  const popView = () => {
    setViewStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const resetView = () => {
    setViewStack(['dashboard']);
    setEditingRecord(null);
    setEditingAccount(null);
    setEditingOwner(null);
    setEditingCategory(null);
    setPreselectedAccountId(null);
  };

  // ---------- Settings mutations ----------

  const handleSetCurrency = async (currency: Currency) => {
    setDefaultCurrency(currency);
    await api.saveSettings({ defaultCurrency: currency });
  };

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    await api.saveSettings({ language: lang });
  };

  // ---------- Record actions ----------

  const handleSaveRecord = async (record: AssetRecord) => {
    if (records.some(r => r.id === record.id)) {
      const updated = await api.updateRecord(record.id, record);
      setRecords(prev => prev.map(r => r.id === record.id ? updated : r));
    } else {
      const created = await api.createRecord(record);
      setRecords(prev => [...prev, created]);
    }
    setEditingRecord(null);
    setPreselectedAccountId(null);
    popView();
  };

  const handleDeleteRecord = async (id: string) => {
    await api.deleteRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEditRecord = (record: AssetRecord) => {
    setEditingRecord(record);
    setPreselectedAccountId(null);
    pushView('entry');
  };

  const handleAddRecordForAccount = (accountId: string) => {
    setEditingRecord(null);
    setPreselectedAccountId(accountId);
    pushView('entry');
  };

  // ---------- Account actions ----------

  const handleSaveAccount = async (acc: Account) => {
    if (accounts.some(a => a.id === acc.id)) {
      const updated = await api.updateAccount(acc.id, acc);
      setAccounts(prev => prev.map(a => a.id === acc.id ? updated : a));
    } else {
      const created = await api.createAccount(acc);
      setAccounts(prev => [...prev, created]);
    }
    setEditingAccount(null);
    popView();
  };

  const handleDeleteAccount = async (acc: Account) => {
    try {
      await api.deleteAccount(acc.id);
      setAccounts(prev => prev.filter(a => a.id !== acc.id));
    } catch (err: any) {
      alert(err.message ?? t('manage.inUseError', language, [acc.name, '?']));
    }
  };

  // ---------- Owner actions ----------

  const handleSaveOwner = async (own: Owner) => {
    if (owners.some(o => o.id === own.id)) {
      const updated = await api.updateOwner(own.id, own.name);
      setOwners(prev => prev.map(o => o.id === own.id ? updated : o));
    } else {
      const created = await api.createOwner(own);
      setOwners(prev => [...prev, created]);
    }
    setEditingOwner(null);
    popView();
  };

  const handleDeleteOwner = async (own: Owner) => {
    try {
      await api.deleteOwner(own.id);
      setOwners(prev => prev.filter(o => o.id !== own.id));
    } catch (err: any) {
      alert(err.message ?? t('manage.inUseError', language, [own.name, '?']));
    }
  };

  // ---------- Category actions ----------

  const handleSaveCategory = async (cat: Category) => {
    if (categories.some(c => c.id === cat.id)) {
      const updated = await api.updateCategory(cat.id, cat);
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
    } else {
      const created = await api.createCategory(cat);
      setCategories(prev => [...prev, created]);
    }
    setEditingCategory(null);
    popView();
  };

  const handleDeleteCategory = async (cat: Category) => {
    try {
      await api.deleteCategory(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (err: any) {
      alert(err.message ?? `Cannot delete category "${cat.name}"`);
    }
  };

  // ---------- Edit helpers ----------

  const startEditAccount = (acc: Account) => { setEditingAccount(acc); pushView('add_account'); };
  const startEditOwner = (own: Owner) => { setEditingOwner(own); pushView('add_owner'); };
  const startEditCategory = (cat: Category) => { setEditingCategory(cat); pushView('add_category'); };

  // ---------- Import / Delete all ----------

  const handleImportData = async (backup: FullBackup) => {
    await api.restoreBackup(backup);
    // Reload all state from server after restore
    const [ownersData, catsData, accsData, recsData] = await Promise.all([
      api.fetchOwners(),
      api.fetchCategories(),
      api.fetchAccounts(),
      api.fetchRecords(),
    ]);
    setOwners(ownersData);
    setCategories(catsData);
    setAccounts(accsData);
    setRecords(recsData);
    resetView();
  };

  const handleDeleteAllData = async () => {
    if (confirm(t('settings.deleteAllConfirm', language))) {
      await api.restoreBackup({ metadata: { version: '2.0', timestamp: Date.now(), exportDate: new Date().toISOString() }, records: [], accounts: [], categories: [], owners: [] });
      setRecords([]);
      setAccounts([]);
      setOwners([]);
      setCategories([]);
      resetView();
      alert(t('settings.deleteAllSuccess', language));
    }
  };

  // ---------- Render ----------

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center">
                  <PiggyBank size={24} />
                </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">{t('app.title', language)}</h1>
          </div>
          <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
            {defaultCurrency}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6">
        {currentView === 'dashboard' && (
            <Dashboard records={records} accounts={accounts} categories={categories} owners={owners} defaultCurrency={defaultCurrency} language={language} />
        )}

        {currentView === 'entry' && (
            <EntryForm accounts={accounts} categories={categories} owners={owners} onSave={handleSaveRecord}
                isDemoMode={false} language={language} initialRecord={editingRecord} lockedAccountId={preselectedAccountId} />
        )}

        {currentView === 'add_account' && (
            <AccountForm onSave={handleSaveAccount} language={language} initialData={editingAccount} categories={categories} owners={owners} />
        )}
        {currentView === 'add_owner' && (
            <OwnerForm onSave={handleSaveOwner} language={language} initialData={editingOwner} />
        )}
        {currentView === 'add_category' && (
            <CategoryForm onSave={handleSaveCategory} language={language} initialData={editingCategory} />
        )}

        {currentView === 'manage_accounts' && (
            <ManagementList title={t('settings.accounts', language)} items={accounts}
                renderTitle={(a: Account) => a.name}
                renderSubtitle={(a: Account) => {
                    const cat = categories.find(c => c.id === a.categoryId);
                    const owner = owners.find(o => o.id === a.ownerId);
                    return `${a.currency} • ${cat?.name ?? 'No Category'} • ${owner?.name ?? 'No Owner'}`;
                }}
                renderIcon={() => <Wallet className="text-blue-500" />}
                onEdit={startEditAccount} onDelete={handleDeleteAccount} language={language} isDemoMode={false} />
        )}
        {currentView === 'manage_owners' && (
            <ManagementList title={t('settings.owners', language)} items={owners}
                renderTitle={(o: Owner) => o.name}
                renderIcon={() => <User className="text-emerald-500" />}
                onEdit={startEditOwner} onDelete={handleDeleteOwner} language={language} isDemoMode={false} />
        )}
        {currentView === 'manage_categories' && (
            <ManagementList title={t('settings.categories', language)} items={categories}
                renderTitle={(c: Category) => c.name}
                renderSubtitle={(c: Category) => c.type === 'ASSET' ? t('dash.assets', language) : t('dash.liabilities', language)}
                renderIcon={(c: Category) => <Tag style={{ color: c.color }} />}
                onEdit={startEditCategory} onDelete={handleDeleteCategory} language={language} isDemoMode={false} />
        )}

        {currentView === 'accounts' && (
            <AccountsTab records={records} accounts={accounts} categories={categories} owners={owners}
                onAddRecord={handleAddRecordForAccount} onEditRecord={handleEditRecord} onDeleteRecord={handleDeleteRecord}
                isDemoMode={false} language={language} />
        )}

        {currentView === 'settings' && (
            <Settings defaultCurrency={defaultCurrency} setCurrency={handleSetCurrency}
                language={language} setLanguage={handleSetLanguage}
                records={records} onImportData={handleImportData} accounts={accounts} categories={categories}
                owners={owners} onNavigate={pushView} onDeleteAllData={handleDeleteAllData} />
        )}
      </main>

      {/* Nav */}
      <Nav currentView={currentView} canGoBack={viewStack.length > 1} onNavigate={pushView}
        onBack={popView} onReset={resetView} language={language}
        onAddAction={(action: string) => {
            if (action === 'add_account') setEditingAccount(null);
            if (action === 'add_owner') setEditingOwner(null);
            if (action === 'add_category') setEditingCategory(null);
            pushView(action);
        }} />
    </div>
  );
};

export default App;
