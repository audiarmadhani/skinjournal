import { env } from './env';

type EventProperties = Record<string, string | number | boolean | undefined>;

export function track(event: string, properties?: EventProperties) {
  if (!env.posthogKey) {
    if (__DEV__) {
      console.log('[analytics]', event, properties);
    }
    return;
  }
  // PostHog can be wired when EXPO_PUBLIC_POSTHOG_KEY is set
  if (__DEV__) {
    console.log('[analytics]', event, properties);
  }
}

export const AnalyticsEvents = {
  photoCaptured: 'photo_captured',
  routineCompleted: 'routine_completed',
  insightViewed: 'insight_viewed',
  shareExported: 'share_exported',
  onboardingCompleted: 'onboarding_completed',
} as const;
