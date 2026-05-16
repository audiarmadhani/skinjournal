import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { shouldUseMock } from '@/lib/env';
import { colors } from '@/lib/theme';

export default function OnboardingLayout() {
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !shouldUseMock()) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.pink} />
      </View>
    );
  }

  if (!isAuthenticated && !shouldUseMock()) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
