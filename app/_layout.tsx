import '../global.css';

if (typeof window !== 'undefined') {
  require('react-native-css-interop/dist/runtime/components');
}
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { LocationCaptureOneShot } from '@/components/LocationCaptureOneShot';
import { RootStack } from '@/components/RootStack';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { getSupabase } from '@/lib/supabase';
import { prepareOnboardingForUser, resetOnboardingSession } from '@/services/onboarding-session';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';
import { useAuthStore } from '@/store/auth-store';

SplashScreen.preventAutoHideAsync();

function AuthSessionListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        prepareOnboardingForUser(session.user.id);
        useAuthStore.getState().setAuthenticated(true, session.user.id);
        setTimeout(() => {
          void syncPendingOnboardingIfNeeded().finally(() => {
            void queryClient.invalidateQueries();
          });
        }, 0);
      } else {
        useAuthStore.getState().setAuthenticated(false, null);
        resetOnboardingSession();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthSessionListener />
          <LocationCaptureOneShot />
          <RootStack />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
