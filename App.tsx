
import React, { useState, useEffect } from 'react';
import { AssetRecord, Currency, Language, Account, Category, Owner, AssetType } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryTable } from './components/HistoryTable';
import { Settings } from './components/Settings';
import { Nav } from './components/Nav';
import { PiggyBank, Save, X } from 'lucide-react';
import { DEMO_RECORDS, INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_OWNERS } from './utils/demoData';
import { t, getCurrencyLabel } from './utils/translations';

// Simple Creation Components inside App for simplicity
const CreateAccountForm = ({ onSave, onCancel, language }: any) => {
    const [name, setName] = useState('');
    const [curr, setCurr] = useState<Currency>(Currency.USD);
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">{t('nav.newAccount', language)}</h2>
            <div className="space-y-4">
                <input className="w-full p-3 border rounded-lg" placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} />
                <select className="w-full p-3 border rounded-lg" value={curr} onChange={e => setCurr(e.target.value as Currency)}>
                    {Object.values(Currency).sort().map(c => <option key={c} value={c}>{getCurrencyLabel(c, language)}</option>)}
                </select>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-lg bg-slate-100 font-bold text-slate-600">Cancel</button>
                    <button onClick={() => onSave({ id: crypto.randomUUID(), name, currency: curr })} className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold">Save</button>
                </div>
            </div>
        </div>
    );
};

const CreateOwnerForm = ({ onSave, onCancel, language }: any) => {
    const [name, setName] = useState('');
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">{t('nav.newOwner', language)}</h2>
            <div className="space-y-4">
                <input className="w-full p-3 border rounded-lg" placeholder="Owner Name" value={name} onChange={e => setName(e.target.value)} />
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-lg bg-slate-100 font-bold text-slate-600">Cancel</button>
                    <button onClick={() => onSave({ id: crypto.randomUUID(), name })} className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-bold">Save</button>
                </div>
            </div>
        </div>
    );
};

const CreateCategoryForm = ({ onSave, onCancel, language }: any) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AssetType>('ASSET');
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">{t('nav.newCategory', language)}</h2>
            <div className="space-y-4">
                <input className="w-full p-3 border rounded-lg" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={() => setType('ASSET')} className={`flex-1 py-2 rounded-lg border ${type === 'ASSET' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200'}`}>Asset</button>
                    <button onClick={() => setType('LIABILITY')} className={`flex-1 py-2 rounded-lg border ${type === 'LIABILITY' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200'}`}>Liability</button>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-lg bg-slate-100 font-bold text-slate-600">Cancel</button>
                    <button onClick={() => onSave({ id: crypto.randomUUID(), name, type, color: type === 'ASSET' ? '#3b82f6' : '#ef4444' })} className="flex-1 py-3 rounded-lg bg-purple-600 text-white font-bold">Save</button>
                </div>
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
        {currentView === 'add_account' && <CreateAccountForm onSave={handleAddAccount} onCancel={popView} language={language} />}
        {currentView === 'add_owner' && <CreateOwnerForm onSave={handleAddOwner} onCancel={popView} language={language} />}
        {currentView === 'add_category' && <CreateCategoryForm onSave={handleAddCategory} onCancel={popView} language={language} />}

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