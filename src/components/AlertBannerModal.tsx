import React, { useEffect } from 'react';
import { ActiveAlert } from '../types.ts';
import { Bell, Check, Clock, X, AlertCircle } from 'lucide-react';
import { formatTime12Hour } from '../utils/time.ts';

interface AlertBannerModalProps {
  alert: ActiveAlert | null;
  onTake: (medicineId: string) => void;
  onSnooze: (alertId: string) => void;
  onSkip: (medicineId: string) => void;
  onDismiss: () => void;
}

export const AlertBannerModal: React.FC<AlertBannerModalProps> = ({
  alert,
  onTake,
  onSnooze,
  onSkip,
  onDismiss,
}) => {
  useEffect(() => {
    // If mobile supports vibration
    if (alert && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 250]);
      } catch {}
    }
  }, [alert]);

  if (!alert) return null;

  const { medicine, dueTime } = alert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="alertdialog" 
        aria-modal="true" 
        aria-labelledby="alert-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
      >
        {/* Header alert stripe */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center animate-pulse">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">
                Medicine Reminder Due
              </div>
              <div className="text-sm font-bold text-white">
                Scheduled for {formatTime12Hour(dueTime)}
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert modal"
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-5">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md mb-2">
              {medicine.form.toUpperCase()} · {medicine.schedule}
            </div>
            <h2 id="alert-title" className="text-2xl font-bold text-slate-900 tracking-tight">
              {medicine.name}
            </h2>
            <p className="text-base font-semibold text-slate-600 mt-1">
              Dose: {medicine.dosage}
            </p>
          </div>

          {medicine.note && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed font-medium">
                {medicine.note}
              </div>
            </div>
          )}

          {medicine.inventoryCount <= medicine.refillThreshold && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-4 text-center">
              ⚠️ Refill alert: Only {medicine.inventoryCount} left in inventory!
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center mb-5">
            Please check your personal prescription label and doctor instructions before taking.
          </p>

          {/* Primary Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => onTake(medicine.id)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Mark as Taken Now</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onSnooze(alert.id)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Snooze 10 Mins</span>
              </button>

              <button
                onClick={() => onSkip(medicine.id)}
                className="py-2.5 px-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-500 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <span>Skip This Dose</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
