import { router } from 'expo-router';
import { data } from '@/services/data-provider';

export async function routeAfterAuth() {
  const profile = await data.getProfile();

  if (!profile.onboarding_completed) {
    router.replace('/(onboarding)/welcome');
    return;
  }

  router.replace('/(tabs)');
}
