export type ScheduleFrequency = 
  | 'Daily' 
  | 'Twice daily' 
  | 'Three times daily' 
  | 'Weekly' 
  | 'As needed (PRN)' 
  | 'One-time demo reminder';

export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'inhaler' 
  | 'drops' 
  | 'topical';

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 tablet", "10 ml"
  time: string; // HH:mm primary reminder
  times?: string[]; // additional times if twice/three times daily
  schedule: ScheduleFrequency;
  note: string; // e.g. "Take with food", "Before bedtime"
  form: MedicationForm;
  color: string; // color accent key: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan'
  inventoryCount: number; // pill/dose count
  refillThreshold: number; // alert if <= this count
  active: boolean;
  createdAt: string;
  lastAlertDate?: string;
  lastAlertTime?: string;
}

export interface DoseRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  recordedAt: string; // ISO timestamp
  date: string; // YYYY-MM-DD
  status: 'taken' | 'skipped';
  notes?: string;
}

export interface ActiveAlert {
  id: string;
  medicine: Medicine;
  dueTime: string;
  triggeredAt: Date;
}

export interface CaregiverContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notes: string;
}
