/** Local calendar date YYYY-MM-DD (device timezone — not UTC). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as a local calendar date (not UTC midnight). */
export function parseLocalDate(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day);
}

export function addLocalDays(iso: string, delta: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + delta);
  return toLocalISODate(d);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function todayISO(): string {
  return toLocalISODate(new Date());
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Rolling 7-day window centered on today (3 days before → 3 days after), local dates. */
export function getWeekStripDates(): { date: string; day: string; label: string }[] {
  const today = new Date();
  const items: { date: string; day: string; label: string }[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    items.push({
      date: toLocalISODate(d),
      day: DAY_LABELS[d.getDay()],
      label: String(d.getDate()),
    });
  }
  return items;
}

export function getWeekStripBounds(): { start: string; end: string } {
  const dates = getWeekStripDates();
  return { start: dates[0].date, end: dates[dates.length - 1].date };
}

export function daysBetween(a: string, b: string): number {
  const ms = Math.abs(parseLocalDate(b).getTime() - parseLocalDate(a).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
