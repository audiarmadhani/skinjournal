import { getSupabase } from '@/lib/supabase';
import type { RoutineLog } from '@/types';
import { todayISO, toLocalISODate } from '@/utils/dates';

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalISODate(d);
}

function hasRoutineActivity(log: Pick<RoutineLog, 'morning_completed' | 'night_completed'>): boolean {
  return (log.morning_completed?.length ?? 0) + (log.night_completed?.length ?? 0) > 0;
}

/** Bump streak when the user logs at least one routine step today. */
export async function syncStreakFromRoutineLog(
  userId: string,
  log: Pick<RoutineLog, 'morning_completed' | 'night_completed'>
): Promise<void> {
  if (!hasRoutineActivity(log)) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const today = todayISO();
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      highest_streak: 1,
      last_log_date: today,
    } as never);
    return;
  }

  if (streak.last_log_date === today) return;

  const continued = streak.last_log_date === yesterdayISO();
  const current_streak = continued ? streak.current_streak + 1 : 1;
  const highest_streak = Math.max(current_streak, streak.highest_streak);

  await supabase
    .from('streaks')
    .update({ current_streak, highest_streak, last_log_date: today } as never)
    .eq('user_id', userId);
}
