
import React from 'react';
import { Edit, Trash2, ChevronRight, Inbox } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface ManagementListProps<T> {
  title: string;
  items: T[];
  renderTitle: (item: T) => string;
  renderSubtitle?: (item: T) => React.ReactNode;
  renderIcon?: (item: T) => React.ReactNode;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  language: Language;
  isDemoMode: boolean;
}

export const ManagementList = <T extends { id: string }>({
  title,
  items,
  renderTitle,
  renderSubtitle,
  renderIcon,
  onEdit,
  onDelete,
  language,
  isDemoMode
}: ManagementListProps<T>) => {
  
  if (items.length === 0) {
    return (
        <div className="p-6 text-center text-slate-500 mt-10 bg-white rounded-xl mx-4 border border-slate-100">
            <Inbox size={48} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-lg font-semibold mb-2">No Items</h2>
            <p>Use the "+" button to create new items.</p>
        </div>
    );
  }

  return (
    <div className="pb-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-800 px-2">{title}</h2>
      
      <div className="space-y-2">
        {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    {renderIcon && (
                        <div className="shrink-0">
                            {renderIcon(item)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{renderTitle(item)}</div>
                        {renderSubtitle && (
                            <div className="text-xs text-slate-500 truncate">{renderSubtitle(item)}</div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => onEdit(item)} 
                        disabled={isDemoMode}
                        className={`p-2 rounded-full transition ${isDemoMode ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                    >
                        <Edit size={18} />
                    </button>
                    
                    <button 
                        onClick={() => onDelete(item)} 
                        disabled={isDemoMode}
                        className={`p-2 -mr-2 rounded-full transition ${isDemoMode ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
