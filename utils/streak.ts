import { addLocalDays, todayISO } from '@/utils/dates';

export function calculateStreak(dates: string[]): { current: number; highest: number } {
  if (dates.length === 0) return { current: 0, highest: 0 };

  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let current = 0;
  let highest = 0;
  let run = 0;
  const today = todayISO();
  const yesterday = addLocalDays(today, -1);

  if (sorted[0] !== today && sorted[0] !== yesterday) {
    return { current: 0, highest: computeHighest(sorted) };
  }

  let expected = sorted[0];
  for (const date of sorted) {
    if (date === expected) {
      run++;
      expected = addLocalDays(date, -1);
    } else {
      highest = Math.max(highest, run);
      run = 0;
      break;
    }
  }
  current = run;
  highest = Math.max(highest, run, computeHighest(sorted));
  return { current, highest };
}

function computeHighest(sorted: string[]): number {
  let highest = 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevDay = addLocalDays(sorted[i - 1], -1);
    if (sorted[i] === prevDay) {
      run++;
    } else {
      highest = Math.max(highest, run);
      run = 1;
    }
  }
  return Math.max(highest, run);
}
