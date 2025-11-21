
import React, { useState, useEffect } from 'react';
import { AssetRecord, Currency, Language } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryTable } from './components/HistoryTable';
import { Settings } from './components/Settings';
import { Nav } from './components/Nav';
import { PiggyBank } from 'lucide-react';
import { DEMO_RECORDS } from './utils/demoData';
import { t } from './utils/translations';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<string>('dashboard');
  const [records, setRecords] = useState<AssetRecord[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(Currency.CAD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedRecordsRaw = localStorage.getItem('fat_records');
    const savedCurrency = localStorage.getItem('fat_currency');
    const savedLanguage = localStorage.getItem('fat_language');
    const savedLogo = localStorage.getItem('fat_logo');
    const savedIsDemo = localStorage.getItem('fat_is_demo') === 'true';

    if (savedCurrency) setDefaultCurrency(savedCurrency as Currency);
    if (savedLanguage) setLanguage(savedLanguage as Language);
    if (savedLogo) setLogoUrl(savedLogo);
    
    // Logic: If explicit demo flag OR no records exist (first load), enter demo mode
    if (savedIsDemo || savedRecordsRaw === null) {
        setIsDemoMode(true);
        // If we have saved demo records, load them. Otherwise load fresh fixtures.
        if (savedRecordsRaw) {
            setRecords(JSON.parse(savedRecordsRaw));
        } else {
            setRecords(DEMO_RECORDS);
        }
    } else {
        // Normal user mode
        setRecords(JSON.parse(savedRecordsRaw || '[]'));
        setIsDemoMode(false);
    }
    
    setLoading(false);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('fat_records', JSON.stringify(records));
      localStorage.setItem('fat_currency', defaultCurrency);
      localStorage.setItem('fat_language', language);
      localStorage.setItem('fat_is_demo', String(isDemoMode));
      if (logoUrl) localStorage.setItem('fat_logo', logoUrl);
    }
  }, [records, defaultCurrency, language, logoUrl, loading, isDemoMode]);

  const handleSaveRecord = (record: AssetRecord) => {
    setRecords([...records, record]);
    setView('dashboard'); // Redirect to dashboard after save
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleUpdateRecord = (record: AssetRecord) => {
    // Placeholder for future edit functionality
    console.log("Update", record);
  };

  const handleImportRecords = (importedRecords: AssetRecord[]) => {
    setRecords(importedRecords);
    setIsDemoMode(false); // Import implicitly exits demo mode
    setView('dashboard');
  };

  const handleExitDemo = () => {
    if (confirm('Are you sure? This will clear all demo data and start with a clean slate.')) {
        setRecords([]);
        setIsDemoMode(false);
        setView('dashboard');
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
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
                    onClick={handleExitDemo}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] uppercase font-bold px-2 py-1 rounded border border-amber-200 transition animate-pulse"
                >
                    Demo Mode
                </button>
            )}
            <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
                {defaultCurrency}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6">
        {view === 'dashboard' && (
            <Dashboard 
                records={records} 
                defaultCurrency={defaultCurrency} 
                language={language}
            />
        )}
        {view === 'entry' && (
            <EntryForm 
                records={records} 
                onSave={handleSaveRecord} 
                defaultCurrency={defaultCurrency} 
                isDemoMode={isDemoMode}
                language={language}
            />
        )}
        {view === 'history' && (
            <HistoryTable 
                records={records} 
                onDelete={handleDeleteRecord} 
                onUpdate={handleUpdateRecord} 
                isDemoMode={isDemoMode}
                language={language}
            />
        )}
        {view === 'settings' && (
            <Settings 
                defaultCurrency={defaultCurrency} 
                setCurrency={setDefaultCurrency}
                language={language}
                setLanguage={setLanguage}
                records={records}
                onImportRecords={handleImportRecords}
                isDemoMode={isDemoMode}
                onExitDemo={handleExitDemo}
            />
        )}
      </main>

      {/* Navigation */}
      <Nav currentView={view} setView={setView} language={language} />

    </div>
  );
};

export default App;
