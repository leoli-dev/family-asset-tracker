
import React from 'react';
import { LayoutDashboard, PlusCircle, List, Settings } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
  language: Language;
}

export const Nav: React.FC<NavProps> = ({ currentView, setView, language }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: t('nav.overview', language) },
    { id: 'entry', icon: <PlusCircle size={24} />, label: t('nav.add', language) },
    { id: 'history', icon: <List size={24} />, label: t('nav.history', language) },
    { id: 'settings', icon: <Settings size={24} />, label: t('nav.settings', language) },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
