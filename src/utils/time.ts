import { DoseRecord } from '../types.ts';

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeHHMM(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${minutes} ${ampm}`;
}

export function getTimeBucket(time24: string): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const [hoursStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  if (hours >= 5 && hours < 12) return 'Morning';
  if (hours >= 12 && hours < 17) return 'Afternoon';
  if (hours >= 17 && hours < 21) return 'Evening';
  return 'Night';
}

export function calculateStreak(doseRecords: DoseRecord[]): number {
  if (!doseRecords.length) return 0;

  // Group records by date where at least one was 'taken'
  const takenDates = new Set<string>();
  doseRecords.forEach(r => {
    if (r.status === 'taken') {
      takenDates.add(r.date);
    }
  });

  let streak = 0;
  const d = new Date();
  
  // Check today first. If taken today, streak starts at 1, else check yesterday.
  const todayKey = getTodayKey();
  let checkDate = new Date(d);

  if (!takenDates.has(todayKey)) {
    // If not yet taken today, see if yesterday was taken
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const day = String(checkDate.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    if (takenDates.has(key)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
