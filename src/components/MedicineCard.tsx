import React from 'react';
import { Medicine, DoseRecord } from '../types.ts';
import { formatTime12Hour } from '../utils/time.ts';
import { 
  Check, 
  RotateCcw, 
  Pill, 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Plus, 
  Volume2
} from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  todayRecord?: DoseRecord;
  onTake: (medicineId: string) => void;
  onUndo: (recordId: string) => void;
  onSkip: (medicineId: string) => void;
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicineId: string) => void;
  onQuickRefill: (medicineId: string, amount: number) => void;
  onTestSound?: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  todayRecord,
  onTake,
  onUndo,
  onSkip,
  onEdit,
  onDelete,
  onQuickRefill,
  onTestSound,
}) => {
  const isTaken = todayRecord?.status === 'taken';
  const isSkipped = todayRecord?.status === 'skipped';
  const isLowStock = medicine.inventoryCount <= medicine.refillThreshold;

  // Color classes map
  const colorMap: Record<string, { iconBg: string; text: string; border: string }> = {
    blue: { iconBg: 'bg-blue-50 text-blue-600', text: 'text-blue-600', border: 'border-blue-200' },
    emerald: { iconBg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' },
    amber: { iconBg: 'bg-amber-50 text-amber-600', text: 'text-amber-600', border: 'border-amber-200' },
    purple: { iconBg: 'bg-purple-50 text-purple-600', text: 'text-purple-600', border: 'border-purple-200' },
    rose: { iconBg: 'bg-rose-50 text-rose-600', text: 'text-rose-200', border: 'border-rose-200' },
    cyan: { iconBg: 'bg-cyan-50 text-cyan-600', text: 'text-cyan-600', border: 'border-cyan-200' },
  };

  const scheme = colorMap[medicine.color] || colorMap.blue;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all ${
      isTaken
        ? 'border-emerald-200/80 bg-emerald-50/20'
        : isSkipped
        ? 'border-slate-200 bg-slate-50/50 opacity-75'
        : 'border-slate-200 shadow-sm hover:border-slate-300'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Pill className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {medicine.name}
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                ({medicine.dosage})
              </span>
            </div>

            {/* Unboxed Metadata with · separator (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-semibold text-slate-700">
                {formatTime12Hour(medicine.time)}
              </span>
              {medicine.times && medicine.times[1] && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700">
                    {formatTime12Hour(medicine.times[1])}
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{medicine.schedule}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{medicine.form}</span>
            </div>

            {/* Note */}
            {medicine.note && (
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-start gap-1.5">
                <span className="text-slate-400 shrink-0 font-medium">Note:</span>
                <span className="font-medium text-slate-700">{medicine.note}</span>
              </p>
            )}

            {/* Inventory count & refill warning */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2.5 flex-wrap">
              <span className={`font-medium ${isLowStock ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                Stock: {medicine.inventoryCount} {medicine.form === 'drops' ? 'drops' : 'left'}
              </span>
              {isLowStock && (
                <button
                  type="button"
                  onClick={() => onQuickRefill(medicine.id, 30)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline decoration-dotted cursor-pointer"
                >
                  + Refill 30
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right actions: Edit & Delete */}
        <div className="flex items-center gap-1 shrink-0">
          {onTestSound && (
            <button
              onClick={() => onTestSound(medicine)}
              title="Test chime for this medicine"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(medicine)}
            title="Edit reminder"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(medicine.id)}
            title="Delete reminder"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Footer for Today's Dose */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {isTaken ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="w-4 h-4" />
              Taken today ({new Date(todayRecord.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
            <button
              onClick={() => onUndo(todayRecord.id)}
              title="Undo taken status"
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-2 cursor-pointer"
            >
              Undo
            </button>
          </div>
        ) : isSkipped ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Skipped today
            </span>
            <button
              onClick={() => onUndo(todayRecord.id)}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-2 cursor-pointer"
            >
              Undo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onSkip(medicine.id)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={() => onTake(medicine.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Taken</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
