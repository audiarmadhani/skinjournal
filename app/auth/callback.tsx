import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { colors } from '@/lib/theme';

/**
 * Deep-link target for OAuth (skinjournal://auth/callback).
 * Most sessions are completed in services/oauth.ts via WebBrowser;
 * this screen is a fallback if the app opens on the callback URL.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const url = Linking.createURL('auth/callback', { queryParams: params as Record<string, string> });
    router.replace('/(auth)/login');
  }, [params]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color={colors.pink} />
    </View>
  );
}
