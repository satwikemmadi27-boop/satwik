import React, { useState, useEffect } from 'react';
import { Medicine, MedicationForm, ScheduleFrequency } from '../types.ts';
import { X, Pill, Clock, Calendar, FileText, Package, AlertTriangle } from 'lucide-react';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'createdAt'>, existingId?: string) => void;
  editingMedicine?: Medicine | null;
}

const FORM_OPTIONS: { id: MedicationForm; label: string }[] = [
  { id: 'tablet', label: 'Tablet' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'liquid', label: 'Liquid / Syrup' },
  { id: 'inhaler', label: 'Inhaler' },
  { id: 'drops', label: 'Eye/Ear Drops' },
  { id: 'injection', label: 'Injection' },
  { id: 'topical', label: 'Cream/Topical' },
];

const SCHEDULE_OPTIONS: ScheduleFrequency[] = [
  'Daily',
  'Twice daily',
  'Three times daily',
  'Weekly',
  'As needed (PRN)',
  'One-time demo reminder',
];

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [secondaryTime, setSecondaryTime] = useState('20:00');
  const [schedule, setSchedule] = useState<ScheduleFrequency>('Daily');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [note, setNote] = useState('');
  const [color, setColor] = useState('blue');
  const [inventoryCount, setInventoryCount] = useState<number>(30);
  const [refillThreshold, setRefillThreshold] = useState<number>(5);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMedicine) {
      setName(editingMedicine.name);
      setDosage(editingMedicine.dosage || '');
      setTime(editingMedicine.time || '08:00');
      if (editingMedicine.times && editingMedicine.times[1]) {
        setSecondaryTime(editingMedicine.times[1]);
      }
      setSchedule(editingMedicine.schedule || 'Daily');
      setForm(editingMedicine.form || 'tablet');
      setNote(editingMedicine.note || '');
      setColor(editingMedicine.color || 'blue');
      setInventoryCount(editingMedicine.inventoryCount ?? 30);
      setRefillThreshold(editingMedicine.refillThreshold ?? 5);
    } else {
      // Default to 10 minutes from now for easy demo testing
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      
      setName('');
      setDosage('1 tablet');
      setTime(`${hh}:${mm}`);
      setSecondaryTime('20:00');
      setSchedule('Daily');
      setForm('tablet');
      setNote('');
      setColor('blue');
      setInventoryCount(30);
      setRefillThreshold(5);
    }
    setError('');
  }, [editingMedicine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide the medicine name.');
      return;
    }
    if (!time) {
      setError('Please specify a reminder time.');
      return;
    }

    const timesArray = schedule === 'Twice daily' ? [time, secondaryTime] : [time];

    onSave(
      {
        name: cleanName,
        dosage: dosage.trim() || '1 unit',
        time,
        times: timesArray,
        schedule,
        form,
        note: note.trim(),
        color,
        inventoryCount: Number(inventoryCount) || 0,
        refillThreshold: Number(refillThreshold) || 5,
        active: true,
      },
      editingMedicine ? editingMedicine.id : undefined
    );
    onClose();
  };

  const handleQuickPreset = (presetName: string, presetDose: string, presetNote: string, presetForm: MedicationForm) => {
    setName(presetName);
    setDosage(presetDose);
    setNote(presetNote);
    setForm(presetForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              ＋
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingMedicine ? 'Edit Medicine Reminder' : 'Add Medicine Reminder'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure time, schedule, and personal dose notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick preset selector for easy testing */}
          {!editingMedicine && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Preset Ideas
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Metformin', '500 mg', 'Take with breakfast', 'tablet')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Metformin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Lisinopril', '10 mg', 'Take in morning with water', 'tablet')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Lisinopril
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Multivitamin & Zinc', '1 gummy', 'Take with midday snack', 'capsule')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Multivitamin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Eye Drops (Lubricant)', '2 drops', 'Instill 1-2 drops per eye', 'drops')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Eye Drops
                </button>
              </div>
            </div>
          )}

          {/* Medicine Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="modalMedName" className="block text-xs font-bold text-slate-700 mb-1">
                Medicine Name *
              </label>
              <input
                id="modalMedName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lisinopril, Vitamin D3"
                maxLength={80}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="modalMedDosage" className="block text-xs font-bold text-slate-700 mb-1">
                Dosage
              </label>
              <input
                id="modalMedDosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 10 mg / 1 pill"
                maxLength={40}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Time & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modalReminderTime" className="block text-xs font-bold text-slate-700 mb-1">
                Reminder Time *
              </label>
              <div className="relative">
                <input
                  id="modalReminderTime"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modalSchedule" className="block text-xs font-bold text-slate-700 mb-1">
                Schedule Frequency
              </label>
              <select
                id="modalSchedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as ScheduleFrequency)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
              >
                {SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {schedule === 'Twice daily' && (
            <div>
              <label htmlFor="modalSecondTime" className="block text-xs font-bold text-slate-700 mb-1">
                Second Dose Time
              </label>
              <input
                id="modalSecondTime"
                type="time"
                value={secondaryTime}
                onChange={(e) => setSecondaryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
              />
            </div>
          )}

          {/* Medication Form */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Form Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {FORM_OPTIONS.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setForm(f.id)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    form === f.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Count & Refill Warning */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label htmlFor="modalInventory" className="block text-xs font-bold text-slate-700 mb-1">
                Pills / Doses in Stock
              </label>
              <input
                id="modalInventory"
                type="number"
                min={0}
                max={999}
                value={inventoryCount}
                onChange={(e) => setInventoryCount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="modalThreshold" className="block text-xs font-bold text-slate-700 mb-1">
                Refill Alert When Under
              </label>
              <input
                id="modalThreshold"
                type="number"
                min={1}
                max={100}
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Color Accent Tag
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  aria-label={`Select ${c.label} color`}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="modalNote" className="block text-xs font-bold text-slate-700 mb-1">
              Care Instructions / Note (Optional)
            </label>
            <input
              id="modalNote"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Take with food, swallow whole with water"
              maxLength={120}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Required Disclaimer from Brief */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Safety Notice:</span> Enter only reminders from your own healthcare provider's care plan. MediLight does not recommend medicines, dosages, or treatments.
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {editingMedicine ? 'Save Changes' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
