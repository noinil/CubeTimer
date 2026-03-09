import type { TimeRecord } from '../types/cube';

const STORAGE_KEY = 'rubiks-timer-records';

export function saveRecord(record: TimeRecord): void {
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecords(): TimeRecord[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function updateRecord(id: string, updates: Partial<TimeRecord>): void {
  const records = getRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}
