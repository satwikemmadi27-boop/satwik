import React, { useState } from 'react';
import { CaregiverContact } from '../types.ts';
import { UserSettings } from '../utils/storage.ts';
import { 
  HeartHandshake, 
  Phone, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface CarePlanViewProps {
  contacts: CaregiverContact[];
  onAddContact: (contact: Omit<CaregiverContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onTestSound: (tone: 'melodic' | 'gentle' | 'alert') => void;
}

export const CarePlanView: React.FC<CarePlanViewProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  settings,
  onUpdateSettings,
  onTestSound,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Doctor');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddContact({
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      notes: notes.trim(),
    });
    setName('');
    setPhone('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdateSettings({ desktopNotifications: true });
        new Notification('MediLight Alerts Activated', {
          body: 'You will receive desktop reminder notifications when medicines are due.',
        });
      } else {
        onUpdateSettings({ desktopNotifications: false });
        alert('Notification permission was blocked in browser settings.');
      }
    } else {
      alert('Desktop notifications are not supported in this browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Reminder & Sound Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Reminder & Alert Settings
            </h2>
            <p className="text-xs text-slate-500">
              Personalize chime sounds, volume, and browser alert permissions
            </p>
          </div>
        </div>

        <div className="pt-5 space-y-4">
          {/* Sound Tone Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
            <div>
              <div className="text-sm font-bold text-slate-800">
                Audible Chime Tone
              </div>
              <div className="text-xs text-slate-500">
                Synthesized melodic harmonics generated through Web Audio API
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={settings.soundTone}
                onChange={(e) => {
                  const newTone = e.target.value as 'melodic' | 'gentle' | 'alert';
                  onUpdateSettings({ soundTone: newTone });
                  onTestSound(newTone);
                }}
                className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="melodic">Melodic Chord (Ascending)</option>
                <option value="gentle">Gentle Bell (Resonant)</option>
                <option value="alert">Medical Beep (Crisp)</option>
              </select>
              <button
                type="button"
                onClick={() => onTestSound(settings.soundTone)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Desktop Push Notification toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
            <div>
              <div className="text-sm font-bold text-slate-800">
                Desktop Notifications
              </div>
              <div className="text-xs text-slate-500">
                Show popup notifications even when the browser tab is in background
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestNotificationPermission}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                settings.desktopNotifications
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {settings.desktopNotifications ? '✓ Notifications Enabled' : 'Enable Notifications'}
            </button>
          </div>
        </div>
      </div>

      {/* Caregiver & Doctor Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Care Circle & Prescribers
              </h2>
              <p className="text-xs text-slate-500">
                Doctor, emergency contacts, and pharmacy information
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
          >
            {showAddForm ? 'Cancel' : '+ Add Contact'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreateContact} className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Bennett / Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship / Role</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Physician">Physician / Doctor</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Caregiver">Caregiver / Family</option>
                  <option value="Emergency">Emergency Contact</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Address</label>
              <input
                type="text"
                placeholder="e.g. Hours, room number, or special instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* List of Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-5">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {contact.relationship}
                  </span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                  </div>
                )}
                {contact.notes && (
                  <p className="text-xs text-slate-500 mt-1">{contact.notes}</p>
                )}
              </div>
              <button
                onClick={() => onDeleteContact(contact.id)}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Care Plan Compliance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Safe Medication Guidelines
            </h3>
            <p className="text-xs text-slate-500">
              Core principles for personal medication management
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Always consult your doctor or pharmacist prior to starting, changing, or stopping any medication.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Never share prescription medications with others. Store medicines in a cool, dry place away from children.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>If you experience unexpected side effects or an allergic reaction, contact emergency services or your physician immediately.</span>
          </li>
        </ul>

        {/* Prototype compliance notice from brief */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <span className="font-bold text-slate-700">MediLight Compliance Note:</span> Enter only reminders from your own doctor's care plan. MediLight does not recommend medicines or doses. Built for personal schedule demonstration by Team Hack Titans.
        </div>
      </div>
    </div>
  );
};
