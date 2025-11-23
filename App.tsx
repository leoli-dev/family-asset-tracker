
import React, { useState, useEffect } from 'react';
import { AssetRecord, Currency, Language, Account, Category, Owner, AssetType, FullBackup } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryTable } from './components/HistoryTable';
import { Settings } from './components/Settings';
import { Nav } from './components/Nav';
import { ManagementList } from './components/ManagementList';
import { PiggyBank, Save, X, Lock, Wallet, User, Tag, Check, Palette } from 'lucide-react';
import { DEMO_RECORDS, INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_OWNERS } from './utils/demoData';
import { t, getCurrencyLabel } from './utils/translations';

// Expanded Palette
const PRESET_COLORS = [
  '#ef4444', // Red 500
  '#dc2626', // Red 600
  '#f97316', // Orange 500
  '#ea580c', // Orange 600
  '#f59e0b', // Amber 500
  '#d97706', // Amber 600
  '#eab308', // Yellow 500
  '#ca8a04', // Yellow 600
  '#84cc16', // Lime 500
  '#65a30d', // Lime 600
  '#10b981', // Emerald 500
  '#059669', // Emerald 600
  '#14b8a6', // Teal 500
  '#0d9488', // Teal 600
  '#06b6d4', // Cyan 500
  '#0891b2', // Cyan 600
  '#3b82f6', // Blue 500
  '#2563eb', // Blue 600
  '#6366f1', // Indigo 500
  '#4f46e5', // Indigo 600
  '#8b5cf6', // Violet 500
  '#7c3aed', // Violet 600
  '#a855f7', // Purple 500
  '#9333ea', // Purple 600
  '#d946ef', // Fuchsia 500
  '#c026d3', // Fuchsia 600
  '#ec4899', // Pink 500
  '#db2777', // Pink 600
  '#f43f5e', // Rose 500
  '#e11d48', // Rose 600
  '#64748b', // Slate 500
  '#475569', // Slate 600
];

// Reusable Creation/Edit Components
const AccountForm = ({ onSave, language, isDemoMode, initialData, categories }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    const [curr, setCurr] = useState<Currency>(initialData?.currency || Currency.USD);
    const [catId, setCatId] = useState(initialData?.categoryId || categories[0]?.id || '');
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
            {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{initialData ? t('manage.edit', language) : t('nav.newAccount', language)}</h2>
            
            <div className={`space-y-5 ${isDemoMode ? 'opacity-60' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                    <input 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50 bg-white"
                        placeholder="e.g., Chase Checking" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        disabled={isDemoMode}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('entry.category', language)}</label>
                    <select 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
                        value={catId} 
                        onChange={e => setCatId(e.target.value)}
                        disabled={isDemoMode}
                    >
                         {categories.map((c: Category) => (
                             <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                         ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
                        value={curr} 
                        onChange={e => setCurr(e.target.value as Currency)}
                        disabled={isDemoMode}
                    >
                        {Object.values(Currency).sort().map(c => <option key={c} value={c}>{getCurrencyLabel(c, language)}</option>)}
                    </select>
                </div>

                <button 
                    onClick={() => onSave({ 
                        id: initialData?.id || crypto.randomUUID(), 
                        name, 
                        currency: curr,
                        categoryId: catId
                    })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

const OwnerForm = ({ onSave, language, isDemoMode, initialData }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
             {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{initialData ? t('manage.edit', language) : t('nav.newOwner', language)}</h2>
            
            <div className={`space-y-5 ${isDemoMode ? 'opacity-60' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                    <input 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:bg-slate-50 bg-white"
                        placeholder="e.g., Alice" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        disabled={isDemoMode}
                    />
                </div>

                <button 
                    onClick={() => onSave({ id: initialData?.id || crypto.randomUUID(), name })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

const CategoryForm = ({ onSave, language, isDemoMode, initialData }: any) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<AssetType>(initialData?.type || 'ASSET');
    const [color, setColor] = useState(initialData?.color || PRESET_COLORS[10]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
             {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{initialData ? t('manage.edit', language) : t('nav.newCategory', language)}</h2>
            
            <div className={`space-y-5 ${isDemoMode ? 'opacity-60' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                    <input 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition disabled:bg-slate-50 bg-white" 
                        placeholder="e.g., Gold" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        disabled={isDemoMode}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setType('ASSET')} 
                            disabled={isDemoMode}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${type === 'ASSET' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}
                        >
                            Asset
                        </button>
                        <button 
                            onClick={() => setType('LIABILITY')} 
                            disabled={isDemoMode}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${type === 'LIABILITY' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 bg-white text-slate-500'}`}
                        >
                            Liability
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('form.color', language)}</label>
                    
                    {/* Color Picker Container */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex flex-wrap gap-3 justify-between mb-4">
                             <div className="w-full text-xs text-slate-400 font-bold uppercase mb-2">Select Color</div>
                             
                             {/* Custom Color Input */}
                             <label className="relative cursor-pointer w-10 h-10 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition group shadow-sm">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    disabled={isDemoMode}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                                />
                                <Palette size={18} className="text-slate-400 group-hover:text-blue-500" />
                             </label>

                             {/* Current Selection Preview (if not in preset list) */}
                             {!PRESET_COLORS.includes(color) && (
                                 <div className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-blue-500 shadow-md flex items-center justify-center" style={{ backgroundColor: color }}>
                                     <Check size={16} className="text-white drop-shadow-md" />
                                 </div>
                             )}
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    disabled={isDemoMode}
                                    className={`w-full aspect-square rounded-full flex items-center justify-center transition hover:scale-110 shadow-sm ${color === c ? 'ring-2 ring-offset-2 ring-slate-500 scale-110 shadow-md' : 'hover:shadow-md'}`}
                                    style={{ backgroundColor: c }}
                                >
                                    {color === c && <Check size={16} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => onSave({ 
                        id: initialData?.id || crypto.randomUUID(), 
                        name, 
                        type, 
                        color: color 
                    })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>{initialData ? t('form.update', language) : t('form.create', language)}</span>
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
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
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Settings
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(Currency.CAD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // App State
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Init
  useEffect(() => {
    const savedRecords = localStorage.getItem('fat_records');
    const savedAccounts = localStorage.getItem('fat_accounts');
    const savedCategories = localStorage.getItem('fat_categories');
    const savedOwners = localStorage.getItem('fat_owners');
    
    const savedCurrency = localStorage.getItem('fat_currency');
    const savedLang = localStorage.getItem('fat_language');
    const savedLogo = localStorage.getItem('fat_logo');
    const savedIsDemo = localStorage.getItem('fat_is_demo') === 'true';

    if (savedCurrency) setDefaultCurrency(savedCurrency as Currency);
    if (savedLang) setLanguage(savedLang as Language);
    if (savedLogo) setLogoUrl(savedLogo);

    if (savedIsDemo || !savedAccounts) { // Check for accounts instead of records as initial state
        setIsDemoMode(true);
        // Load Demo Data if in demo mode or fresh start
        setRecords(savedRecords ? JSON.parse(savedRecords) : DEMO_RECORDS);
        setAccounts(savedAccounts ? JSON.parse(savedAccounts) : INITIAL_ACCOUNTS);
        setCategories(savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES);
        setOwners(savedOwners ? JSON.parse(savedOwners) : INITIAL_OWNERS);
    } else {
        setIsDemoMode(false);
        setRecords(JSON.parse(savedRecords || '[]'));
        setAccounts(JSON.parse(savedAccounts || '[]'));
        setCategories(JSON.parse(savedCategories || '[]'));
        setOwners(JSON.parse(savedOwners || '[]'));
    }
    
    setLoading(false);
  }, []);

  // Persistence
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('fat_records', JSON.stringify(records));
      localStorage.setItem('fat_accounts', JSON.stringify(accounts));
      localStorage.setItem('fat_categories', JSON.stringify(categories));
      localStorage.setItem('fat_owners', JSON.stringify(owners));

      localStorage.setItem('fat_currency', defaultCurrency);
      localStorage.setItem('fat_language', language);
      localStorage.setItem('fat_is_demo', String(isDemoMode));
      if (logoUrl) localStorage.setItem('fat_logo', logoUrl);
    }
  }, [records, accounts, categories, owners, defaultCurrency, language, logoUrl, loading, isDemoMode]);

  // Navigation Helpers
  const pushView = (view: string) => {
    if (currentView !== view) {
        setViewStack([...viewStack, view]);
    }
  };

  const popView = () => {
    if (viewStack.length > 1) {
        setViewStack(viewStack.slice(0, -1));
    }
  };

  const resetView = () => {
    setViewStack(['dashboard']);
    setEditingRecord(null);
    setEditingAccount(null);
    setEditingOwner(null);
    setEditingCategory(null);
  };

  // Record Actions
  const handleSaveRecord = (record: AssetRecord) => {
    if (records.some(r => r.id === record.id)) {
        // Update existing record
        setRecords(records.map(r => r.id === record.id ? record : r));
    } else {
        // Create new
        setRecords([...records, record]);
    }
    setEditingRecord(null);
    popView(); 
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };
  
  const handleEditRecord = (record: AssetRecord) => {
      setEditingRecord(record);
      pushView('entry');
  };

  // Entity Management Actions (Create/Update)
  const handleSaveAccount = (acc: Account) => {
    if (accounts.some(a => a.id === acc.id)) {
        setAccounts(accounts.map(a => a.id === acc.id ? acc : a));
    } else {
        setAccounts([...accounts, acc]);
    }
    setEditingAccount(null);
    popView();
  };
  
  const handleSaveOwner = (own: Owner) => {
    if (owners.some(o => o.id === own.id)) {
        setOwners(owners.map(o => o.id === own.id ? own : o));
    } else {
        setOwners([...owners, own]);
    }
    setEditingOwner(null);
    popView();
  };

  const handleSaveCategory = (cat: Category) => {
    if (categories.some(c => c.id === cat.id)) {
        setCategories(categories.map(c => c.id === cat.id ? cat : c));
    } else {
        setCategories([...categories, cat]);
    }
    setEditingCategory(null);
    popView();
  };

  // Entity Deletion (with safety check)
  const checkUsage = (id: string, type: 'account' | 'category' | 'owner'): number => {
      if (type === 'account') return records.filter(r => r.accountId === id).length;
      if (type === 'owner') return records.filter(r => r.ownerId === id).length;
      if (type === 'category') return accounts.filter(a => a.categoryId === id).length; // Check if used by accounts
      return 0;
  };

  const handleDeleteAccount = (acc: Account) => {
    if (isDemoMode) { alert("Cannot delete in Demo Mode"); return; }
    const usageCount = checkUsage(acc.id, 'account');
    if (usageCount > 0) {
        alert(t('manage.inUseError', language, [acc.name, usageCount]));
        return;
    }
    if (confirm(t('manage.deleteConfirm', language, [acc.name]))) {
        setAccounts(accounts.filter(a => a.id !== acc.id));
    }
  };

  const handleDeleteOwner = (own: Owner) => {
    if (isDemoMode) { alert("Cannot delete in Demo Mode"); return; }
    const usageCount = checkUsage(own.id, 'owner');
    if (usageCount > 0) {
        alert(t('manage.inUseError', language, [own.name, usageCount]));
        return;
    }
    if (confirm(t('manage.deleteConfirm', language, [own.name]))) {
        setOwners(owners.filter(o => o.id !== own.id));
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (isDemoMode) { alert("Cannot delete in Demo Mode"); return; }
    const usageCount = checkUsage(cat.id, 'category');
    if (usageCount > 0) {
        alert(`Cannot delete category "${cat.name}" because it is assigned to ${usageCount} account(s). Please reassign or delete the accounts first.`);
        return;
    }
    if (confirm(t('manage.deleteConfirm', language, [cat.name]))) {
        setCategories(categories.filter(c => c.id !== cat.id));
    }
  };

  // Prepare Edit
  const startEditAccount = (acc: Account) => {
      setEditingAccount(acc);
      pushView('add_account');
  };
  const startEditOwner = (own: Owner) => {
      setEditingOwner(own);
      pushView('add_owner');
  };
  const startEditCategory = (cat: Category) => {
      setEditingCategory(cat);
      pushView('add_category');
  };

  const handleImportData = (backup: FullBackup) => {
    setRecords(backup.records || []);
    setAccounts(backup.accounts || []);
    setCategories(backup.categories || []);
    setOwners(backup.owners || []);
    
    setIsDemoMode(false);
    resetView();
  };

  const handleExitDemo = () => {
    if (confirm('Are you sure? This will clear all demo data.')) {
        setRecords([]);
        setAccounts([]);
        setOwners([]);
        setCategories([]); 
        setIsDemoMode(false);
        resetView();
    }
  };

  const handleDeleteAllData = () => {
      if (confirm(t('settings.deleteAllConfirm', language))) {
        setRecords([]);
        setAccounts([]);
        setOwners([]);
        setCategories([]);
        setIsDemoMode(false);
        resetView();
        alert(t('settings.deleteAllSuccess', language));
      }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            ) : (
                <div className="w-10 h-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center">
                  <PiggyBank size={24} />
                </div>
            )}
            <h1 className="text-lg font-bold tracking-tight text-slate-800">{t('app.title', language)}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isDemoMode && (
                <button 
                    onClick={() => pushView('settings')}
                    className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-1 rounded border border-amber-200 animate-pulse"
                >
                    Demo
                </button>
            )}
            <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
                {defaultCurrency}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6">
        {currentView === 'dashboard' && (
            <Dashboard 
                records={records}
                accounts={accounts}
                categories={categories}
                owners={owners}
                defaultCurrency={defaultCurrency} 
                language={language}
            />
        )}
        
        {currentView === 'entry' && (
            <EntryForm 
                accounts={accounts}
                categories={categories}
                owners={owners}
                onSave={handleSaveRecord} 
                isDemoMode={isDemoMode}
                language={language}
                initialRecord={editingRecord}
            />
        )}

        {/* Forms (Create & Edit) */}
        {currentView === 'add_account' && (
            <AccountForm 
                onSave={handleSaveAccount} 
                language={language} 
                isDemoMode={isDemoMode} 
                initialData={editingAccount}
                categories={categories}
            />
        )}
        {currentView === 'add_owner' && (
            <OwnerForm 
                onSave={handleSaveOwner} 
                language={language} 
                isDemoMode={isDemoMode} 
                initialData={editingOwner}
            />
        )}
        {currentView === 'add_category' && (
            <CategoryForm 
                onSave={handleSaveCategory} 
                language={language} 
                isDemoMode={isDemoMode} 
                initialData={editingCategory}
            />
        )}

        {/* Management List Views */}
        {currentView === 'manage_accounts' && (
             <ManagementList 
                title={t('settings.accounts', language)}
                items={accounts}
                renderTitle={(a) => a.name}
                renderSubtitle={(a) => {
                    const cat = categories.find(c => c.id === a.categoryId);
                    return `${a.currency} • ${cat?.name || 'No Category'}`;
                }}
                renderIcon={() => <Wallet className="text-blue-500" />}
                onEdit={startEditAccount}
                onDelete={handleDeleteAccount}
                language={language}
                isDemoMode={isDemoMode}
             />
        )}
        {currentView === 'manage_owners' && (
             <ManagementList 
                title={t('settings.owners', language)}
                items={owners}
                renderTitle={(o) => o.name}
                renderIcon={() => <User className="text-emerald-500" />}
                onEdit={startEditOwner}
                onDelete={handleDeleteOwner}
                language={language}
                isDemoMode={isDemoMode}
             />
        )}
        {currentView === 'manage_categories' && (
             <ManagementList 
                title={t('settings.categories', language)}
                items={categories}
                renderTitle={(c) => c.name}
                renderSubtitle={(c) => c.type === 'ASSET' ? t('dash.assets', language) : t('dash.liabilities', language)}
                renderIcon={(c) => <Tag style={{ color: c.color }} />}
                onEdit={startEditCategory}
                onDelete={handleDeleteCategory}
                language={language}
                isDemoMode={isDemoMode}
             />
        )}

        {currentView === 'history' && (
            <HistoryTable 
                records={records}
                accounts={accounts}
                categories={categories}
                owners={owners}
                onDelete={handleDeleteRecord} 
                onUpdate={handleEditRecord} 
                isDemoMode={isDemoMode}
                language={language}
            />
        )}
        {currentView === 'settings' && (
            <Settings 
                defaultCurrency={defaultCurrency} 
                setCurrency={setDefaultCurrency}
                language={language}
                setLanguage={setLanguage}
                records={records}
                onImportData={handleImportData}
                isDemoMode={isDemoMode}
                onExitDemo={handleExitDemo}
                accounts={accounts}
                categories={categories}
                owners={owners}
                onNavigate={pushView}
                onDeleteAllData={handleDeleteAllData}
            />
        )}
      </main>

      {/* Nav */}
      <Nav 
        currentView={currentView} 
        canGoBack={viewStack.length > 1}
        onNavigate={pushView}
        onBack={popView}
        onReset={resetView}
        language={language}
        onAddAction={(action) => {
            if (action === 'entry') setEditingRecord(null);
            if (action === 'add_account') setEditingAccount(null);
            if (action === 'add_owner') setEditingOwner(null);
            if (action === 'add_category') setEditingCategory(null);
            pushView(action);
        }}
      />

    </div>
  );
};

export default App;
