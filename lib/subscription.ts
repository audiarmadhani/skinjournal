import { env } from './env';
import type { Profile } from '@/types';

export type SubscriptionTier = 'free' | 'premium';

export function isPremiumProfile(profile: Pick<Profile, 'subscription_tier' | 'premium_expires_at'> | null | undefined): boolean {
  if (env.forcePremium) return true;
  if (!profile) return false;
  if (profile.subscription_tier !== 'premium') return false;
  if (!profile.premium_expires_at) return true;
  return new Date(profile.premium_expires_at).getTime() > Date.now();
}

export function canAnalyzeFace(profile: Profile | null | undefined): boolean {
  return isPremiumProfile(profile);
}

export const PREMIUM_FEATURES = [
  'AI face analysis on every photo',
  'Personalized skin observations',
  'Progress insights vs your baseline',
  'Full Insights tab with AI summaries',
] as const;
