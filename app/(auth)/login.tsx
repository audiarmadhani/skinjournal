import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { routeAfterAuth } from '@/features/auth/utils/route-after-auth';
import { data } from '@/services/data-provider';
import { signInWithOAuth, oauthRedirectUri } from '@/services/oauth';
import { prepareOnboardingForUser } from '@/services/onboarding-session';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';
import { useAuthStore } from '@/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { PrimaryButton } from '@/components/ui';
import { posthog } from '@/lib/posthog';

function authErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const { restart } = useLocalSearchParams<{ restart?: string }>();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const isRestart = restart === '1';

  const finishAuth = async () => {
    await syncPendingOnboardingIfNeeded();
    void queryClient.invalidateQueries();
    await routeAfterAuth();
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const session = await data.signIn(email, password);
      prepareOnboardingForUser(session.user.id);
      useAuthStore.getState().setAuthenticated(true, session.user.id);
      posthog.identify(session.user.id, { email: session.user.email });
      posthog.capture('user_signed_in', { method: 'email' });
      await data.ensureProfile();
      await finishAuth();
    } catch (error) {
      Alert.alert('Sign in failed', authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithOAuth();
      await finishAuth();
    } catch (error) {
      const message = authErrorMessage(error);
      if (message !== 'Sign in was cancelled') {
        Alert.alert(
          'Google sign in failed',
          `${message}\n\nAdd this redirect URL in Supabase if needed:\n${oauthRedirectUri}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <View className="flex-1 justify-center">
        <View className="w-16 h-16 rounded-full bg-pink items-center justify-center mb-6 self-center">
          <Text className="text-2xl">✨</Text>
        </View>
        <Text className="text-ink text-3xl font-bold mb-2 text-center">Welcome back</Text>
        <Text className="text-muted text-base mb-8 text-center">
          {isRestart
            ? 'Sign in to save your new setup and sync your routine.'
            : 'Sign in to continue your journey.'}
        </Text>
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />

        <View className="flex-row items-center my-8">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="text-muted mx-4 text-sm">or</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

        <PrimaryButton
          title="Continue with Google"
          variant="secondary"
          onPress={handleGoogleSignIn}
          loading={loading}
          disabled={loading}
        />

        <Link href="/(auth)/signup" asChild>
          <Pressable className="mt-8 items-center">
            <Text className="text-muted">
              New here? <Text className="text-ink font-bold">Create account</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
