import React from 'react';
import { Medicine, DoseRecord } from '../types.ts';
import { formatTime12Hour } from '../utils/time.ts';
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Trash2 
} from 'lucide-react';

interface AdherenceViewProps {
  medicines: Medicine[];
  doseRecords: DoseRecord[];
  streak: number;
  onClearHistory: () => void;
}

export const AdherenceView: React.FC<AdherenceViewProps> = ({
  medicines,
  doseRecords,
  streak,
  onClearHistory,
}) => {
  // Compute past 7 days dates
  const days: { label: string; dateStr: string; takenCount: number; skippedCount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    
    const dayRecords = doseRecords.filter(r => r.date === dateStr);
    const taken = dayRecords.filter(r => r.status === 'taken').length;
    const skipped = dayRecords.filter(r => r.status === 'skipped').length;
    
    days.push({
      label: dayLabel,
      dateStr,
      takenCount: taken,
      skippedCount: skipped,
    });
  }

  const totalDosesLogged = doseRecords.length;
  const takenTotal = doseRecords.filter(r => r.status === 'taken').length;
  const adherenceRate = totalDosesLogged > 0 ? Math.round((takenTotal / totalDosesLogged) * 100) : 100;

  const handleExportCSV = () => {
    if (doseRecords.length === 0) {
      alert('No dose logs recorded yet to export.');
      return;
    }
    const headers = ['Date', 'Scheduled Time', 'Recorded At', 'Medicine Name', 'Dosage', 'Status'];
    const rows = doseRecords.map(r => [
      r.date,
      r.scheduledTime,
      new Date(r.recordedAt).toLocaleTimeString(),
      `"${r.medicineName.replace(/"/g, '""')}"`,
      `"${r.dosage.replace(/"/g, '""')}"`,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medilight-adherence-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Medication Adherence History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track dose consistency, streak records, and export reports for your care team
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Overall Adherence</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {adherenceRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {takenTotal} of {totalDosesLogged} recorded doses taken
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Consecutive Streak</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums flex items-center gap-1.5">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>{streak} Days</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Active daily medication discipline
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Total Doses Tracked</div>
            <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">
              {totalDosesLogged}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Lifetime logs in this browser
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Past 7 Days Adherence Overview</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center">
          {days.map((day, idx) => {
            const hasActivity = day.takenCount > 0 || day.skippedCount > 0;
            return (
              <div 
                key={day.dateStr}
                className={`p-3 rounded-xl border transition-all ${
                  day.takenCount > 0
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : hasActivity
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                  {day.label}
                </div>
                <div className="mt-2 text-lg font-bold tabular-nums">
                  {day.takenCount > 0 ? (
                    <span className="text-emerald-700">{day.takenCount}✓</span>
                  ) : hasActivity ? (
                    <span className="text-amber-700">0</span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {day.takenCount > 0 ? 'taken' : hasActivity ? 'missed' : 'empty'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Dose Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dose Event Log
            </h3>
            <p className="text-xs text-slate-500">
              Recent medicine actions recorded in real time
            </p>
          </div>
          {doseRecords.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your adherence history?')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {doseRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No medication events recorded yet. Mark your reminders as "Taken" on the Today tab to generate your history log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Dose</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Recorded At</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doseRecords.slice(0, 30).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {record.medicineName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {record.dosage}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {formatTime12Hour(record.scheduledTime)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {record.status === 'taken' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Taken
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Skipped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
