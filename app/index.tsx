import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { useProfile } from '@/hooks/useProfile';
import { shouldUseMock } from '@/lib/env';
import { useAuthStore } from '@/store/auth-store';
import { clearAuthAndOnboarding } from '@/services/onboarding-session';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';
import { data } from '@/services/data-provider';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isLoading, isAuthenticated } = useSession();
  const { data: profile, isLoading: profileLoading, isError: profileError } =
    useProfile(isAuthenticated);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (isLoading) return;
    if (profileLoading && isAuthenticated) return;

    const timer = setTimeout(async () => {
      if (!isAuthenticated) {
        if (shouldUseMock()) {
          useAuthStore.getState().setAuthenticated(true, 'mock-user-audi');
          router.replace('/(tabs)');
          return;
        }
        router.replace('/(auth)/login');
        return;
      }

      if (profileError) {
        await data.signOut();
        clearAuthAndOnboarding();
        router.replace('/(auth)/login');
        return;
      }

      await syncPendingOnboardingIfNeeded();

      if (!profile?.onboarding_completed) {
        router.replace('/(onboarding)/welcome');
        return;
      }
      router.replace('/(tabs)');
    }, 1400);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, profile, profileLoading, profileError]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        <View className="w-20 h-20 rounded-full bg-pink items-center justify-center mb-5">
          <Text className="text-3xl">✨</Text>
        </View>
        <Text className="text-ink text-4xl font-bold tracking-tight mb-3">SkinJournal</Text>
        <Text className="text-muted text-base">Track your skin journey.</Text>
      </Animated.View>
    </View>
  );
}
