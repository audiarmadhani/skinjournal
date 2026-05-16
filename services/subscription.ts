import { shouldUseMock } from '@/lib/env';
import { data } from './data-provider';

/** Activate premium on the current profile (dev/mock testing only). */
export async function activatePremiumForTesting(): Promise<void> {
  if (!shouldUseMock() && !__DEV__) {
    throw new Error('Premium activation is only available in development.');
  }
  await data.updateProfile({
    subscription_tier: 'premium',
    premium_expires_at: null,
  });
}

export async function deactivatePremiumForTesting(): Promise<void> {
  if (!shouldUseMock() && !__DEV__) {
    throw new Error('Only available in development.');
  }
  await data.updateProfile({
    subscription_tier: 'free',
    premium_expires_at: null,
  });
}
