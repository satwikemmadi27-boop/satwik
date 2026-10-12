import React, { useState } from 'react';
import { Medicine, DoseRecord } from '../types.ts';
import { MedicineCard } from './MedicineCard.tsx';
import { getTimeBucket, formatTime12Hour } from '../utils/time.ts';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  Bell, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Sparkles,
  Info
} from 'lucide-react';

interface TodayScheduleProps {
  medicines: Medicine[];
  todayRecords: DoseRecord[];
  streak: number;
  onTake: (medicineId: string) => void;
  onUndo: (recordId: string) => void;
  onSkip: (medicineId: string) => void;
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicineId: string) => void;
  onQuickRefill: (medicineId: string, amount: number) => void;
  onOpenAddModal: () => void;
  onTestAlert: (customMedicine?: Medicine) => void;
  onLoadDemoRoutine: () => void;
  statusMessage: string;
}

type FilterBucket = 'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  medicines,
  todayRecords,
  streak,
  onTake,
  onUndo,
  onSkip,
  onEdit,
  onDelete,
  onQuickRefill,
  onOpenAddModal,
  onTestAlert,
  onLoadDemoRoutine,
  statusMessage,
}) => {
  const [activeBucket, setActiveBucket] = useState<FilterBucket>('All');

  // Filter medicines that are active and scheduled for today (Daily or One-time)
  const scheduledToday = medicines.filter((m) => m.active);

  const takenCount = todayRecords.filter((r) => r.status === 'taken').length;
  const totalCount = scheduledToday.length;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Filter based on selected bucket
  const filteredMedicines = scheduledToday.filter((m) => {
    if (activeBucket === 'All') return true;
    return getTimeBucket(m.time) === activeBucket;
  });

  // Find next upcoming medicine
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Sorted by time
  const sortedMedicines = [...filteredMedicines].sort((a, b) => a.time.localeCompare(b.time));

  // Check any low refill items
  const lowRefillCount = medicines.filter(m => m.inventoryCount <= m.refillThreshold).length;

  return (
    <div className="space-y-6">
      {/* Hero Adherence KPI Bar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Today's Care Routine
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              "A little reminder can make a big difference."
            </p>
          </div>

          {/* Quick Action Simulator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onTestAlert()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Chime Alert</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Adherence Today</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {takenCount} <span className="text-sm font-normal text-slate-400">/ {totalCount} taken</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${adherenceRate}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Adherence Rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {adherenceRate}%
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {adherenceRate === 100 && totalCount > 0 ? 'All doses taken today!' : `${totalCount - takenCount} doses remaining`}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Current Streak</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums flex items-center gap-1.5">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>{streak} days</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Consecutive adherence
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Refill Status</div>
            <div className={`text-2xl font-bold mt-1 tabular-nums ${lowRefillCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {lowRefillCount > 0 ? `${lowRefillCount} Low` : 'Healthy'}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {lowRefillCount > 0 ? 'Action needed soon' : 'All prescriptions stocked'}
            </div>
          </div>
        </div>
      </section>

      {/* Reminder Engine Status Banner */}
      <section className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <div className="text-blue-900 font-medium">
            <span className="font-bold">Reminder Engine Active:</span> {statusMessage}
          </div>
        </div>
        <div className="text-slate-500 text-[11px] shrink-0">
          Checks scheduled times automatically every second
        </div>
      </section>

      {/* Time Bucket Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl">
          {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as FilterBucket[]).map((bucket) => {
            const count = bucket === 'All' 
              ? scheduledToday.length 
              : scheduledToday.filter(m => getTimeBucket(m.time) === bucket).length;

            return (
              <button
                key={bucket}
                onClick={() => setActiveBucket(bucket)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeBucket === bucket
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bucket} <span className="text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500">
          Showing {sortedMedicines.length} of {scheduledToday.length} reminders
        </div>
      </div>

      {/* Medicines Cards List */}
      <div className="space-y-3">
        {sortedMedicines.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No reminders in this schedule window
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your prescribed medicine or load our standard starter routine to test alerts immediately.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
              >
                + Add Reminder
              </button>
              <button
                onClick={onLoadDemoRoutine}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Load Demo Routine
              </button>
            </div>
          </div>
        ) : (
          sortedMedicines.map((med) => {
            const record = todayRecords.find((r) => r.medicineId === med.id);
            return (
              <MedicineCard
                key={med.id}
                medicine={med}
                todayRecord={record}
                onTake={onTake}
                onUndo={onUndo}
                onSkip={onSkip}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickRefill={onQuickRefill}
                onTestSound={() => onTestAlert(med)}
              />
            );
          })
        )}
      </div>

      {/* Safety & Care Plan Note */}
      <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-700">Medical Safety & Care Notice</p>
          <p className="mt-0.5 leading-relaxed">
            Enter only reminders from your personal care plan. MediLight does not recommend medicines, dosages, or clinical treatments. Keep this browser window open or pinned to receive audible chimes when doses are due.
          </p>
        </div>
      </div>
    </div>
  );
};
