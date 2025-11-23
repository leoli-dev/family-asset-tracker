
import React, { useState } from 'react';
import { LayoutDashboard, Plus, List, Settings, ArrowLeft, UserPlus, Wallet, Tag, FilePlus } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface NavProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
  onReset: () => void;
  canGoBack: boolean;
  currentView: string;
  language: Language;
  onAddAction: (action: 'entry' | 'add_account' | 'add_owner' | 'add_category') => void;
}

export const Nav: React.FC<NavProps> = ({ onNavigate, onBack, onReset, canGoBack, currentView, language, onAddAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAddClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAction = (action: 'entry' | 'add_account' | 'add_owner' | 'add_category') => {
    setIsMenuOpen(false);
    onAddAction(action);
  };

  return (
    <>
      {/* Radial Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)}>
           <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-4 pb-4 animate-in slide-in-from-bottom-10 fade-in duration-200">
              
              <div className="flex gap-4">
                <button onClick={() => handleAction('add_account')} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg">
                        <Wallet size={20} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{t('nav.newAccount', language)}</span>
                </button>
                
                <button onClick={() => handleAction('add_owner')} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg">
                        <UserPlus size={20} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{t('nav.newOwner', language)}</span>
                </button>

                <button onClick={() => handleAction('add_category')} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-lg">
                        <Tag size={20} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{t('nav.newCategory', language)}</span>
                </button>
              </div>

              <button onClick={() => handleAction('entry')} className="flex items-center gap-2 bg-white px-6 py-3 rounded-full text-slate-900 font-bold shadow-xl active:scale-95 transition">
                  <FilePlus size={20} className="text-blue-600" />
                  {t('nav.newEntry', language)}
              </button>

           </div>
        </div>
      )}

      {/* Footer Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          
          {/* Back Button */}
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              !canGoBack ? 'text-slate-200 cursor-default' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowLeft size={24} />
          </button>

          {/* Overview (Home) */}
          <button
            onClick={onReset}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold">{t('nav.overview', language)}</span>
          </button>

          {/* ADD Button (Center) */}
          <div className="relative -top-5">
            <button
                onClick={handleAddClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                    isMenuOpen ? 'bg-slate-800 rotate-45' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                <Plus size={28} className="text-white" />
            </button>
          </div>

          {/* History */}
          <button
            onClick={() => onNavigate('history')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={24} />
            <span className="text-[10px] font-bold">{t('nav.history', language)}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings size={24} />
            <span className="text-[10px] font-bold">{t('nav.settings', language)}</span>
          </button>

        </div>
      </nav>
    </>
  );
};
