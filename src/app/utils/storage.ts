import type { TimeRecord, PuzzleType } from '../types/cube';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}

export function exportRecords(records: TimeRecord[], puzzleType: PuzzleType): void {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `CubeTimerResults/${puzzleType}_${timestamp}.dat`;

  const header = `# puzzle: ${puzzleType}\n# scramble,time,date`;
  const rows = records.map(r => {
    const scramble = r.scramble.replace(/\s+/g, '');
    const time = r.dnf ? 'DNF' : formatTime(r.time + (r.plus2 ? 2000 : 0));
    const date = new Date(r.date).toLocaleString('zh-CN');
    return `${scramble},${time},${date}`;
  });

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
