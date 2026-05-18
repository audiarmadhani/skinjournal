import PostHog from 'posthog-react-native';

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const isConfigured = Boolean(apiKey && host);

if (__DEV__ && !isConfigured) {
  console.warn('PostHog: EXPO_PUBLIC_POSTHOG_KEY or EXPO_PUBLIC_POSTHOG_HOST is not set. Analytics will be disabled.');
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host,
  disabled: !isConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
});
