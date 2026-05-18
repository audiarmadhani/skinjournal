import '../global.css';

if (typeof window !== 'undefined') {
  require('react-native-css-interop/dist/runtime/components');
}
import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { usePathname, useGlobalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { queryClient } from '@/lib/query-client';
import { LocationCaptureOneShot } from '@/components/LocationCaptureOneShot';
import { RootStack } from '@/components/RootStack';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { getSupabase } from '@/lib/supabase';
import { prepareOnboardingForUser, resetOnboardingSession } from '@/services/onboarding-session';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';
import { useAuthStore } from '@/store/auth-store';
import { posthog } from '@/lib/posthog';

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
        posthog.identify(session.user.id, { email: session.user.email });
        setTimeout(() => {
          void syncPendingOnboardingIfNeeded().finally(() => {
            void queryClient.invalidateQueries();
          });
        }, 0);
      } else {
        useAuthStore.getState().setAuthenticated(false, null);
        resetOnboardingSession();
        posthog.reset();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  return null;
}

function ScreenTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, { previous_screen: previousPathname.current ?? null, ...params });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: true }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ScreenTracker />
            <AuthSessionListener />
            <LocationCaptureOneShot />
            <RootStack />
          </ThemeProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
