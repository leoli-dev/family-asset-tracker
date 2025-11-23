
import React, { useState, useEffect } from 'react';
import { AssetRecord, Currency, Language, Account, Category, Owner, AssetType } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryTable } from './components/HistoryTable';
import { Settings } from './components/Settings';
import { Nav } from './components/Nav';
import { PiggyBank, Save, X, Lock } from 'lucide-react';
import { DEMO_RECORDS, INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_OWNERS } from './utils/demoData';
import { t, getCurrencyLabel } from './utils/translations';

// Simple Creation Components inside App for simplicity
const CreateAccountForm = ({ onSave, language, isDemoMode }: any) => {
    const [name, setName] = useState('');
    const [curr, setCurr] = useState<Currency>(Currency.USD);
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
            {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{t('nav.newAccount', language)}</h2>
            
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
                    onClick={() => onSave({ id: crypto.randomUUID(), name, currency: curr })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>Save Account</span>
                </button>
            </div>
        </div>
    );
};

const CreateOwnerForm = ({ onSave, language, isDemoMode }: any) => {
    const [name, setName] = useState('');
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
             {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{t('nav.newOwner', language)}</h2>
            
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
                    onClick={() => onSave({ id: crypto.randomUUID(), name })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>Save Owner</span>
                </button>
            </div>
        </div>
    );
};

const CreateCategoryForm = ({ onSave, language, isDemoMode }: any) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AssetType>('ASSET');
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-24 relative overflow-hidden">
             {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 text-center text-amber-800 text-xs font-bold z-10">
                {t('entry.demoBanner', language)}
                </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-4">{t('nav.newCategory', language)}</h2>
            
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

                <button 
                    onClick={() => onSave({ id: crypto.randomUUID(), name, type, color: type === 'ASSET' ? '#3b82f6' : '#ef4444' })} 
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isDemoMode ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'}`}
                    disabled={isDemoMode}
                >
                    {isDemoMode ? <Lock size={20} /> : <Save size={20} />}
                    <span>Save Category</span>
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

    if (savedIsDemo || !savedRecords) {
        setIsDemoMode(true);
        // Load Demo Data if in demo mode
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
  };

  // Actions
  const handleSaveRecord = (record: AssetRecord) => {
    setRecords([...records, record]);
    popView(); // Go back after save
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleAddAccount = (acc: Account) => {
    setAccounts([...accounts, acc]);
    popView();
  };
  const handleAddOwner = (own: Owner) => {
    setOwners([...owners, own]);
    popView();
  };
  const handleAddCategory = (cat: Category) => {
    setCategories([...categories, cat]);
    popView();
  };

  const handleImportRecords = (importedRecords: AssetRecord[]) => {
    // Simplified import - assuming valid ID structure for now or full state restore
    // A full restore would replace everything, here we just replace records for simplicity based on old interface
    // But with new relational data, restore usually implies restoring the whole DB.
    // For this specific "Settings" feature, we might need to disable it or update it later. 
    // Retaining simple record replacement for now.
    setRecords(importedRecords);
    setIsDemoMode(false);
    resetView();
  };

  const handleExitDemo = () => {
    if (confirm('Are you sure? This will clear all demo data.')) {
        setRecords([]);
        setAccounts([]);
        setOwners([]);
        // Keep default categories maybe? No, clear all as requested "Clean Slate"
        setCategories([]); 
        setIsDemoMode(false);
        resetView();
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
            />
        )}

        {/* New Creation Views */}
        {currentView === 'add_account' && (
            <CreateAccountForm 
                onSave={handleAddAccount} 
                language={language} 
                isDemoMode={isDemoMode} 
            />
        )}
        {currentView === 'add_owner' && (
            <CreateOwnerForm 
                onSave={handleAddOwner} 
                language={language} 
                isDemoMode={isDemoMode} 
            />
        )}
        {currentView === 'add_category' && (
            <CreateCategoryForm 
                onSave={handleAddCategory} 
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
                onUpdate={() => {}} 
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
                onImportRecords={handleImportRecords}
                isDemoMode={isDemoMode}
                onExitDemo={handleExitDemo}
                accounts={accounts}
                categories={categories}
                owners={owners}
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
        onAddAction={(action) => pushView(action)}
      />

    </div>
  );
};

export default App;
