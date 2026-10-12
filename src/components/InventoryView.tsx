import React from 'react';
import { Medicine } from '../types.ts';
import { Package, AlertCircle, Plus, CheckCircle, PhoneCall, Pill } from 'lucide-react';

interface InventoryViewProps {
  medicines: Medicine[];
  onUpdateStock: (medicineId: string, newCount: number) => void;
  onQuickRefill: (medicineId: string, amount: number) => void;
  onOpenAddModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  medicines,
  onUpdateStock,
  onQuickRefill,
  onOpenAddModal,
}) => {
  const lowStockMeds = medicines.filter(m => m.inventoryCount <= m.refillThreshold);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Prescription & Refill Inventory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor remaining pills and doses to order refills before running out
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            + Add New Medication
          </button>
        </div>

        {lowStockMeds.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-900">
                {lowStockMeds.length} Medication{lowStockMeds.length > 1 ? 's' : ''} Need Refilling Soon
              </div>
              <div className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                {lowStockMeds.map(m => m.name).join(', ')} {lowStockMeds.length > 1 ? 'are' : 'is'} at or below refill thresholds. Contact your pharmacy to submit a refill.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Medicine Bottles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medicines.map((med) => {
          const isLow = med.inventoryCount <= med.refillThreshold;
          const isCritical = med.inventoryCount <= 2;
          
          // Estimate daily usage
          const dailyDoses = med.schedule === 'Twice daily' ? 2 : med.schedule === 'Three times daily' ? 3 : 1;
          const daysLeft = Math.floor(med.inventoryCount / dailyDoses);

          return (
            <div
              key={med.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-300 bg-rose-50/10'
                  : isLow
                  ? 'border-amber-200/90 bg-amber-50/10'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {med.dosage} · {med.schedule}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isCritical
                    ? 'bg-rose-100 text-rose-800'
                    : isLow
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {isCritical ? 'Critical Stock' : isLow ? 'Refill Soon' : 'In Stock'}
                </span>
              </div>

              {/* Stock Bar & Numbers */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">
                    Remaining in bottle:
                  </span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {med.inventoryCount} {med.form === 'drops' ? 'drops' : 'doses'}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      (~{daysLeft} days)
                    </span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, (med.inventoryCount / 60) * 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Threshold alert: {med.refillThreshold}</span>
                  <span>Target capacity: ~60</span>
                </div>
              </div>

              {/* Quick Adjustment Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateStock(med.id, Math.max(0, med.inventoryCount - 1))}
                    title="Deduct 1"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onUpdateStock(med.id, med.inventoryCount + 1)}
                    title="Add 1"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +1
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onQuickRefill(med.id, 30)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    +30 Refill
                  </button>
                  <button
                    onClick={() => onQuickRefill(med.id, 60)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    +60
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
