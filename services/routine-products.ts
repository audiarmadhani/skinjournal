import * as Crypto from 'expo-crypto';
import type { Product, ProfileSex, RoutineType, SkinGoal } from '@/types';
import type { RoutineProductDraft } from '@/types/routine';
import { getSelectedRoutineProducts } from '@/features/onboarding/utils/validate-routine';
import { todayISO } from '@/utils/dates';
import { defaultUsageIntervalForStepName } from '@/utils/product-schedule';
import { data } from './data-provider';

export const DEFAULT_MORNING = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'];
export const DEFAULT_NIGHT = ['Cleanser', 'Retinol', 'Moisturizer'];

export function buildProducts(
  userId: string,
  morning: RoutineProductDraft[],
  night: RoutineProductDraft[]
): Product[] {
  const date = todayISO();

  const toProducts = (drafts: RoutineProductDraft[], routineType: RoutineType): Product[] =>
    getSelectedRoutineProducts(drafts).map((p) => ({
      id: Crypto.randomUUID(),
      user_id: userId,
      name: p.name,
      brand: p.brand.trim(),
      routine_type: routineType,
      started_at: date,
      usage_interval_days: defaultUsageIntervalForStepName(p.name),
    }));

  return [...toProducts(morning, 'morning'), ...toProducts(night, 'night')];
}

/** Persist onboarding routine + profile fields. */
export async function persistOnboardingRoutine(opts: {
  skinGoals: SkinGoal[];
  concerns: string[];
  morningRoutine: RoutineProductDraft[];
  nightRoutine: RoutineProductDraft[];
  ageYears?: number | null;
  sex?: ProfileSex | null;
  markComplete?: boolean;
}) {
  const profile = await data.getProfile();
  const products = buildProducts(profile.id, opts.morningRoutine, opts.nightRoutine);

  await data.saveProducts(products);
  await data.updateProfile({
    skin_goals: opts.skinGoals,
    concerns: opts.concerns,
    ...(opts.ageYears != null ? { age_years: opts.ageYears } : {}),
    ...(opts.sex != null ? { sex: opts.sex } : {}),
    ...(opts.markComplete ? { onboarding_completed: true } : {}),
  });

  return products;
}

