import type { Product, RoutineLog } from '@/types';
import { getProductsDueOnDate } from '@/utils/product-schedule';
import { addLocalDays, parseLocalDate, todayISO } from '@/utils/dates';

/** Only count completions when the log row matches the calendar day we're scoring. */
function logForDate(log: RoutineLog | null | undefined, dateIso: string): RoutineLog | null | undefined {
  if (!log || log.date !== dateIso) return undefined;
  return log;
}

export function routineProgress(
  products: Product[],
  log: RoutineLog | null | undefined,
  dateIso: string = todayISO()
): { completed: number; total: number; percent: number } {
  const effective = logForDate(log, dateIso);
  const due = getProductsDueOnDate(products, dateIso);
  const morning = due.filter((p) => p.routine_type === 'morning');
  const night = due.filter((p) => p.routine_type === 'night');
  const total = morning.length + night.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };

  const morningDone = morning.filter((p) => effective?.morning_completed?.includes(p.id)).length;
  const nightDone = night.filter((p) => effective?.night_completed?.includes(p.id)).length;
  const completed = morningDone + nightDone;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export function isRoutineLogComplete(
  products: Product[],
  log: RoutineLog | null | undefined,
  dateIso: string = todayISO()
): boolean {
  const { total, percent } = routineProgress(products, log, dateIso);
  return total > 0 && percent === 100;
}

export function formatLogDate(dateIso: string): string {
  const today = todayISO();
  const d = parseLocalDate(dateIso);
  if (dateIso === today) return 'Today';
  const yesterday = addLocalDays(today, -1);
  if (dateIso === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
