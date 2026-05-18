import type { Photo, Product, RoutineLog } from '@/types';
import { parseLocalDate, todayISO, toLocalISODate } from '@/utils/dates';
import { countSessionsInRange } from '@/utils/photo-sessions';
import { routineProgress } from '@/utils/routine';

export function getLast7DaysBounds(): { start: string; end: string } {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return { start: toLocalISODate(weekAgo), end: todayISO() };
}

function datesFromTo(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  while (cursor <= endDate) {
    dates.push(toLocalISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function computeWeeklySummary(
  photos: Photo[] | undefined,
  products: Product[],
  weekLogs: RoutineLog[] | undefined,
  todayRoutine: RoutineLog | undefined
): { photosThisWeek: number; routineConsistency: number } {
  const today = todayISO();
  const { start: weekStart } = getLast7DaysBounds();
  const photosThisWeek = countSessionsInRange(photos ?? [], weekStart, today);

  if (products.length === 0) {
    return { photosThisWeek, routineConsistency: 0 };
  }

  const logsByDate = new Map((weekLogs ?? []).map((log) => [log.date, log]));
  if (todayRoutine?.date) {
    logsByDate.set(todayRoutine.date, todayRoutine);
  }

  const datesInRange = datesFromTo(weekStart, today);
  let totalSteps = 0;
  let completedSteps = 0;
  for (const date of datesInRange) {
    const { completed, total } = routineProgress(products, logsByDate.get(date), date);
    totalSteps += total;
    completedSteps += completed;
  }

  const routineConsistency =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return { photosThisWeek, routineConsistency };
}
