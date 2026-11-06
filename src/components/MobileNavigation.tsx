import React from 'react';
import { 
  Clock, 
  ListTodo, 
  StickyNote, 
  RefreshCw, 
  Plus 
} from 'lucide-react';

export type ActiveTab = 'timeline' | 'list' | 'notes' | 'sync';

interface MobileNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  pendingSyncCount: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  pendingSyncCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 sm:hidden transition-colors w-full max-w-full overflow-hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-1 relative w-full max-w-full">
        {/* Timeline Tab */}
        <button
          onClick={() => onChangeTab('timeline')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'timeline'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Timeline</span>
        </button>

        {/* List Tab */}
        <button
          onClick={() => onChangeTab('list')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'list'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <ListTodo className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Daftar</span>
        </button>

        {/* Center Floating Action Button (Tambah Jadwal) */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            title="Tambah Jadwal Baru"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Catatan Cepat Tab */}
        <button
          onClick={() => onChangeTab('notes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'notes'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <StickyNote className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Catatan</span>
        </button>

        {/* Sync & Settings Tab */}
        <button
          onClick={() => onChangeTab('sync')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
            activeTab === 'sync'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <RefreshCw className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sinkron</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
