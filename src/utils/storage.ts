import { Medicine, DoseRecord, CaregiverContact } from '../types.ts';

const STORAGE_KEY_MEDICINES = 'medilight_medicines_v2';
const STORAGE_KEY_DOSES = 'medilight_dose_records_v2';
const STORAGE_KEY_SETTINGS = 'medilight_user_settings';
const STORAGE_KEY_CONTACTS = 'medilight_caregivers';

// Fallback to check if legacy prototype stored anything
const LEGACY_STORAGE_KEY = 'medilight_medicines';

export interface UserSettings {
  soundEnabled: boolean;
  soundTone: 'melodic' | 'gentle' | 'alert';
  desktopNotifications: boolean;
  vibrationEnabled: boolean;
  snoozeMinutes: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  soundTone: 'melodic',
  desktopNotifications: false,
  vibrationEnabled: true,
  snoozeMinutes: 10,
};

export const INITIAL_DEMO_MEDICINES: Medicine[] = [
  {
    id: 'med-demo-1',
    name: 'Lisinopril',
    dosage: '10 mg (1 tablet)',
    time: '08:00',
    schedule: 'Daily',
    note: 'Take in the morning with a full glass of water',
    form: 'tablet',
    color: 'blue',
    inventoryCount: 28,
    refillThreshold: 7,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-demo-2',
    name: 'Vitamin D3 & Calcium',
    dosage: '1000 IU (1 capsule)',
    time: '13:00',
    schedule: 'Daily',
    note: 'Take with lunchtime meal for optimal absorption',
    form: 'capsule',
    color: 'amber',
    inventoryCount: 45,
    refillThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-demo-3',
    name: 'Magnesium Glycinate',
    dosage: '200 mg (2 capsules)',
    time: '21:00',
    schedule: 'Daily',
    note: 'Take 30 minutes before bed to support muscle relaxation',
    form: 'capsule',
    color: 'purple',
    inventoryCount: 14,
    refillThreshold: 6,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export function loadMedicines(): Medicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check legacy
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        const upgraded: Medicine[] = legacyParsed.map((item, idx) => ({
          id: item.id ? String(item.id) : `legacy-${idx}-${Date.now()}`,
          name: item.name || 'Sample Medicine',
          dosage: '1 unit',
          time: item.time || '09:00',
          schedule: item.schedule || 'Daily',
          note: item.note || '',
          form: 'tablet',
          color: 'blue',
          inventoryCount: 30,
          refillThreshold: 5,
          active: true,
          createdAt: new Date().toISOString(),
          lastAlertDate: item.lastAlertDate || '',
        }));
        saveMedicines(upgraded);
        return upgraded;
      }
    }

    // Default seed
    saveMedicines(INITIAL_DEMO_MEDICINES);
    return INITIAL_DEMO_MEDICINES;
  } catch {
    return INITIAL_DEMO_MEDICINES;
  }
}

export function saveMedicines(medicines: Medicine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(medicines));
    // Also sync back to legacy key for backwards compatibility
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(medicines.map(m => ({
      id: m.id,
      name: m.name,
      time: m.time,
      schedule: m.schedule,
      note: m.note,
      lastAlertDate: m.lastAlertDate || '',
    }))));
  } catch (err) {
    console.error('Failed to save medicines to localStorage', err);
  }
}

export function loadDoseRecords(): DoseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveDoseRecords(records: DoseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DOSES, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save dose records', err);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function loadCaregivers(): CaregiverContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTACTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    {
      id: 'contact-1',
      name: 'Primary Care Doctor (Dr. Bennett)',
      relationship: 'Physician',
      phone: '+1 (555) 234-5678',
      notes: 'Clinic: Metro Family Health · Office hours M-F 8am-5pm',
    },
    {
      id: 'contact-2',
      name: 'Local Pharmacy (CarePlus)',
      relationship: 'Pharmacy',
      phone: '+1 (555) 876-5432',
      notes: 'Refill automated line: ext 2 · Rx on file',
    },
  ];
}

export function saveCaregivers(contacts: CaregiverContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save caregivers', err);
  }
}
