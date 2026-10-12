import React from 'react';
import { Bell, Volume2, VolumeX, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserSettings } from '../utils/storage.ts';

interface TopNavProps {
  activeTab: 'schedule' | 'medicines' | 'adherence' | 'inventory' | 'careplan';
  setActiveTab: (tab: 'schedule' | 'medicines' | 'adherence' | 'inventory' | 'careplan') => void;
  onOpenAddModal: () => void;
  onTestAlert: () => void;
  settings: UserSettings;
  onToggleSound: () => void;
  pendingDoseCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onTestAlert,
  settings,
  onToggleSound,
  pendingDoseCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Strict 3-zone desktop contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm shadow-blue-500/20">
            ＋
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 leading-none">
              MediLight
            </div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5 hidden sm:block">
              Smart Medicine Reminder
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Today's Schedule
            {pendingDoseCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                {pendingDoseCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'medicines'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Medications
          </button>

          <button
            onClick={() => setActiveTab('adherence')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'adherence'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Adherence Log
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Refill Stock
          </button>

          <button
            onClick={() => setActiveTab('careplan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'careplan'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Care Plan
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTestAlert}
            title="Simulate reminder chime and alarm dialog"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Test Chime</span>
          </button>

          <button
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
            aria-label="Toggle Sound"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-100 px-2 py-1.5 bg-slate-50/80 overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'schedule' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Today
          {pendingDoseCount > 0 && ` (${pendingDoseCount})`}
        </button>
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'medicines' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Meds
        </button>
        <button
          onClick={() => setActiveTab('adherence')}
          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'adherence' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Adherence
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'inventory' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Refills
        </button>
        <button
          onClick={() => setActiveTab('careplan')}
          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'careplan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Care Plan
        </button>
        <button
          onClick={onTestAlert}
          className="px-2 py-1 text-xs text-blue-700 bg-blue-100/70 rounded-md whitespace-nowrap shrink-0 ml-auto flex items-center gap-1"
        >
          <Bell className="w-3 h-3" />
          Test
        </button>
      </div>
    </header>
  );
};
