import type { Photo } from '@/types';
import type { InsightContext } from '@/services/insight-engine';
import { data } from '@/services/data-provider';
import { daysBetween, todayISO } from '@/utils/dates';
import { getBaselinePrimaryPhoto } from '@/utils/photo-sessions';
import { routineProgress } from '@/utils/routine';

export interface BuildInsightContextInput {
  lightingQuality?: string;
  photos?: Photo[];
  /** Baseline session date if known (overrides lookup from photos). */
  baselineDate?: string | null;
}

/** Build real journal context for AI / template insights. */
export async function buildInsightContext(
  input: BuildInsightContextInput = {}
): Promise<InsightContext> {
  const today = todayISO();

  const [streak, products, routine] = await Promise.all([
    data.getStreak(),
    data.getProducts(),
    data.getTodayRoutine(),
  ]);

  const allProducts = products ?? [];
  const { percent } = routineProgress(allProducts, routine, today);

  const baselinePhoto = getBaselinePrimaryPhoto(input.photos ?? []);
  const baselineDate = input.baselineDate ?? baselinePhoto?.date ?? null;
  const daysSinceBaseline =
    baselineDate != null ? Math.max(0, daysBetween(baselineDate, today)) : undefined;

  return {
    daysSinceBaseline,
    streak: streak?.current_streak ?? 0,
    routinePercent: percent,
    lightingQuality: input.lightingQuality ?? 'fair',
    compareWithLastWeek: true,
  };
}
