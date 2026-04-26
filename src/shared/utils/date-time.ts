// 300 → "05:00", 480 → "08:00", 65 → "01:05"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 300, 480 → 180
export function calcDuration(startTime: number, endTime: number): number {
  return endTime - startTime;
}

// 1592611200000 → "2020-06-20"
export function timestampToDateString(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}
