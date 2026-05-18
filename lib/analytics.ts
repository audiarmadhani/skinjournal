import { posthog } from './posthog';

type EventProperties = Record<string, string | number | boolean | undefined>;

export function track(event: string, properties?: EventProperties) {
  if (__DEV__) {
    console.log('[analytics]', event, properties);
  }
  posthog.capture(event, properties);
}

export const AnalyticsEvents = {
  photoCaptured: 'photo_captured',
  routineCompleted: 'routine_completed',
  insightViewed: 'insight_viewed',
  shareExported: 'share_exported',
  onboardingCompleted: 'onboarding_completed',
} as const;
