import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Medicine, DoseRecord, ActiveAlert, CaregiverContact } from './types.ts';
import { 
  loadMedicines, 
  saveMedicines, 
  loadDoseRecords, 
  saveDoseRecords, 
  loadSettings, 
  saveSettings, 
  loadCaregivers, 
  saveCaregivers, 
  INITIAL_DEMO_MEDICINES,
  UserSettings 
} from './utils/storage.ts';
import { getTodayKey, getCurrentTimeHHMM, calculateStreak, formatTime12Hour } from './utils/time.ts';
import { playReminderChime, playSuccessChime } from './utils/audio.ts';
import { TopNav } from './components/TopNav.tsx';
import { TodaySchedule } from './components/TodaySchedule.tsx';
import { MedicineCard } from './components/MedicineCard.tsx';
import { AddMedicineModal } from './components/AddMedicineModal.tsx';
import { AlertBannerModal } from './components/AlertBannerModal.tsx';
import { AdherenceView } from './components/AdherenceView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { CarePlanView } from './components/CarePlanView.tsx';
import { Plus, Bell, Volume2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doseRecords, setDoseRecords] = useState<DoseRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [caregivers, setCaregivers] = useState<CaregiverContact[]>([]);
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'medicines' | 'adherence' | 'inventory' | 'careplan'>('schedule');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  
  const [statusMessage, setStatusMessage] = useState('Monitoring schedule. Keep this page open for audible reminders.');
  const alertedSetRef = useRef<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    const loadedMeds = loadMedicines();
    setMedicines(loadedMeds);
    setDoseRecords(loadDoseRecords());
    setCaregivers(loadCaregivers());
  }, []);

  // Save changes
  useEffect(() => {
    if (medicines.length > 0) {
      saveMedicines(medicines);
    }
  }, [medicines]);

  useEffect(() => {
    saveDoseRecords(doseRecords);
  }, [doseRecords]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (caregivers.length > 0) {
      saveCaregivers(caregivers);
    }
  }, [caregivers]);

  const todayKey = getTodayKey();
  const todayRecords = doseRecords.filter(r => r.date === todayKey);
  const pendingDoses = medicines.filter(m => {
    if (!m.active) return false;
    const hasTaken = todayRecords.some(r => r.medicineId === m.id && r.status === 'taken');
    return !hasTaken;
  });

  // Reminder Checker Loop (runs every 5 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const nowTime = getCurrentTimeHHMM();
      const today = getTodayKey();

      medicines.forEach(med => {
        if (!med.active) return;
        
        // Check primary time and any secondary times
        const timesToCheck = [med.time, ...(med.times || [])].filter(Boolean);

        timesToCheck.forEach(targetTime => {
          const alertKey = `${med.id}-${today}-${targetTime}`;
          
          if (targetTime === nowTime && !alertedSetRef.current.has(alertKey)) {
            // Check if already taken today for this scheduled time
            const alreadyTaken = todayRecords.some(r => r.medicineId === med.id && r.status === 'taken');
            if (alreadyTaken && med.schedule === 'Daily') {
              return;
            }

            alertedSetRef.current.add(alertKey);

            // Fire Alert
            setActiveAlert({
              id: alertKey,
              medicine: med,
              dueTime: targetTime,
              triggeredAt: new Date(),
            });

            // Audible Chime
            if (settings.soundEnabled) {
              playReminderChime(settings.soundTone);
            }

            // Desktop push notification if enabled
            if (settings.desktopNotifications && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`MediLight Reminder: ${med.name}`, {
                  body: `Time for ${med.dosage} (${formatTime12Hour(targetTime)}). ${med.note || ''}`,
                  icon: '/favicon.ico',
                });
              } catch {}
            }

            setStatusMessage(`Reminder triggered: ${med.name} at ${formatTime12Hour(targetTime)}.`);
          }
        });
      });
    };

    const intervalId = setInterval(checkReminders, 5000);
    checkReminders(); // Initial check
    return () => clearInterval(intervalId);
  }, [medicines, settings, todayRecords]);

  // Streak Calculation
  const streak = calculateStreak(doseRecords);

  // Dose Actions
  const handleTake = (medicineId: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const newRecord: DoseRecord = {
      id: `dose-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicineId: med.id,
      medicineName: med.name,
      dosage: med.dosage,
      scheduledTime: med.time,
      recordedAt: new Date().toISOString(),
      date: getTodayKey(),
      status: 'taken',
    };

    // Decrement inventory stock
    const updatedMeds = medicines.map(m => {
      if (m.id === medicineId) {
        return {
          ...m,
          inventoryCount: Math.max(0, m.inventoryCount - 1),
        };
      }
      return m;
    });

    setMedicines(updatedMeds);
    const updatedRecords = [newRecord, ...doseRecords];
    setDoseRecords(updatedRecords);

    // Audio confirmation
    playSuccessChime();

    // Close any active alert for this med
    if (activeAlert?.medicine.id === medicineId) {
      setActiveAlert(null);
    }

    // Check if this was the last dose of the day!
    const activeCount = updatedMeds.filter(m => m.active).length;
    const takenTodayCount = updatedRecords.filter(r => r.date === getTodayKey() && r.status === 'taken').length;
    
    if (takenTodayCount >= activeCount && activeCount > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      setStatusMessage(`Great job! All ${activeCount} medications completed for today.`);
    } else {
      setStatusMessage(`Recorded: ${med.name} taken.`);
    }
  };

  const handleUndo = (recordId: string) => {
    const record = doseRecords.find(r => r.id === recordId);
    if (!record) return;

    // Restore inventory if it was marked taken
    if (record.status === 'taken') {
      setMedicines(prev => prev.map(m => {
        if (m.id === record.medicineId) {
          return { ...m, inventoryCount: m.inventoryCount + 1 };
        }
        return m;
      }));
    }

    setDoseRecords(prev => prev.filter(r => r.id !== recordId));
    setStatusMessage(`Undo: Dose record removed for ${record.medicineName}.`);
  };

  const handleSkip = (medicineId: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const newRecord: DoseRecord = {
      id: `dose-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicineId: med.id,
      medicineName: med.name,
      dosage: med.dosage,
      scheduledTime: med.time,
      recordedAt: new Date().toISOString(),
      date: getTodayKey(),
      status: 'skipped',
    };

    setDoseRecords(prev => [newRecord, ...prev]);

    if (activeAlert?.medicine.id === medicineId) {
      setActiveAlert(null);
    }
    setStatusMessage(`Marked dose for ${med.name} as skipped.`);
  };

  const handleSnooze = (alertId: string) => {
    setActiveAlert(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() + settings.snoozeMinutes);
    const snoozeTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setStatusMessage(`Reminder snoozed for ${settings.snoozeMinutes} minutes (will chime again at ${formatTime12Hour(snoozeTimeStr)}).`);

    setTimeout(() => {
      if (activeAlert?.medicine) {
        setActiveAlert({
          id: `snooze-${Date.now()}`,
          medicine: activeAlert.medicine,
          dueTime: snoozeTimeStr,
          triggeredAt: new Date(),
        });
        if (settings.soundEnabled) {
          playReminderChime(settings.soundTone);
        }
      }
    }, settings.snoozeMinutes * 60 * 1000);
  };

  const handleSaveMedicine = (data: Omit<Medicine, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setMedicines(prev => prev.map(m => {
        if (m.id === existingId) {
          return { ...m, ...data };
        }
        return m;
      }));
      setStatusMessage(`Updated reminder for ${data.name}.`);
    } else {
      const newMed: Medicine = {
        ...data,
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setMedicines(prev => [newMed, ...prev]);
      setStatusMessage(`Added new reminder for ${data.name} at ${formatTime12Hour(data.time)}.`);
    }
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    if (confirm(`Remove reminder for "${med.name}"?`)) {
      setMedicines(prev => prev.filter(m => m.id !== medicineId));
      setStatusMessage(`Removed reminder for ${med.name}.`);
    }
  };

  const handleQuickRefill = (medicineId: string, amount: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === medicineId) {
        return { ...m, inventoryCount: m.inventoryCount + amount };
      }
      return m;
    }));
    setStatusMessage(`Added +${amount} to inventory.`);
  };

  const handleUpdateStock = (medicineId: string, newCount: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === medicineId) {
        return { ...m, inventoryCount: newCount };
      }
      return m;
    }));
  };

  const handleTestAlert = (customMed?: Medicine) => {
    const testMed = customMed || medicines[0] || INITIAL_DEMO_MEDICINES[0];
    
    // Play sound immediately
    if (settings.soundEnabled) {
      playReminderChime(settings.soundTone);
    }

    setActiveAlert({
      id: `test-${Date.now()}`,
      medicine: testMed,
      dueTime: testMed.time || getCurrentTimeHHMM(),
      triggeredAt: new Date(),
    });
    setStatusMessage(`Testing alarm chime & popup for ${testMed.name}.`);
  };

  const handleLoadDemoRoutine = () => {
    setMedicines(INITIAL_DEMO_MEDICINES);
    saveMedicines(INITIAL_DEMO_MEDICINES);
    setStatusMessage('Loaded standard daily medicine starter routine.');
  };

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: nextSound }));
    if (nextSound) {
      playSuccessChime();
    }
    setStatusMessage(nextSound ? 'Audible reminder chime enabled.' : 'Reminder chime muted.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingMedicine(null);
          setIsAddModalOpen(true);
        }}
        onTestAlert={() => handleTestAlert()}
        settings={settings}
        onToggleSound={handleToggleSound}
        pendingDoseCount={pendingDoses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'schedule' && (
          <TodaySchedule
            medicines={medicines}
            todayRecords={todayRecords}
            streak={streak}
            onTake={handleTake}
            onUndo={handleUndo}
            onSkip={handleSkip}
            onEdit={(med) => {
              setEditingMedicine(med);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteMedicine}
            onQuickRefill={handleQuickRefill}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            onTestAlert={handleTestAlert}
            onLoadDemoRoutine={handleLoadDemoRoutine}
            statusMessage={statusMessage}
          />
        )}

        {activeTab === 'medicines' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  All Scheduled Medications ({medicines.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage medication names, dosage instructions, times, and inventory tracking
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadDemoRoutine}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Demo Routine
                </button>
                <button
                  onClick={() => {
                    setEditingMedicine(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicines.map((med) => {
                const record = todayRecords.find(r => r.medicineId === med.id);
                return (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    todayRecord={record}
                    onTake={handleTake}
                    onUndo={handleUndo}
                    onSkip={handleSkip}
                    onEdit={(m) => {
                      setEditingMedicine(m);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeleteMedicine}
                    onQuickRefill={handleQuickRefill}
                    onTestSound={() => handleTestAlert(med)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'adherence' && (
          <AdherenceView
            medicines={medicines}
            doseRecords={doseRecords}
            streak={streak}
            onClearHistory={() => setDoseRecords([])}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            medicines={medicines}
            onUpdateStock={handleUpdateStock}
            onQuickRefill={handleQuickRefill}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'careplan' && (
          <CarePlanView
            contacts={caregivers}
            onAddContact={(newContact) => {
              const c: CaregiverContact = {
                ...newContact,
                id: `contact-${Date.now()}`,
              };
              setCaregivers(prev => [...prev, c]);
            }}
            onDeleteContact={(id) => {
              setCaregivers(prev => prev.filter(c => c.id !== id));
            }}
            settings={settings}
            onUpdateSettings={(newVals) => {
              setSettings(prev => ({ ...prev, ...newVals }));
            }}
            onTestSound={(tone) => {
              playReminderChime(tone);
            }}
          />
        )}
      </main>

      {/* Active Alarm Modal Dialog */}
      <AlertBannerModal
        alert={activeAlert}
        onTake={handleTake}
        onSnooze={handleSnooze}
        onSkip={handleSkip}
        onDismiss={() => setActiveAlert(null)}
      />

      {/* Add / Edit Medicine Modal Form */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        editingMedicine={editingMedicine}
      />

      {/* Clean Footer matching user's prototype brief */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-semibold text-slate-700">
            MediLight · Smart Medicine Reminder
          </p>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
            A little reminder can make a big difference. Enter only reminders from your personal care plan. MediLight does not recommend medicines or doses.
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Team Hack Titans · MediLight · Built for Demonstration & Personal Schedule Tracking
          </p>
        </div>
      </footer>
    </div>
  );
}
