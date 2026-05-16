import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { routeAfterAuth } from '@/features/auth/utils/route-after-auth';
import { data } from '@/services/data-provider';
import { signInWithOAuth, oauthRedirectUri } from '@/services/oauth';
import { prepareOnboardingForUser } from '@/services/onboarding-session';
import { useAuthStore } from '@/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { PrimaryButton } from '@/components/ui';

function authErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSignup = async (email: string, password: string, name?: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = (name ?? '').trim();
    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const session = await data.signUp(trimmedEmail, password, trimmedName);
      prepareOnboardingForUser(session.user.id);
      useAuthStore.getState().setAuthenticated(true, session.user.id);
      await data.ensureProfile();
      void queryClient.invalidateQueries();
      router.replace('/(onboarding)/welcome');
    } catch (error) {
      Alert.alert('Sign up failed', authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithOAuth();
      void queryClient.invalidateQueries();
      await routeAfterAuth();
    } catch (error) {
      const message = authErrorMessage(error);
      if (message !== 'Sign in was cancelled') {
        Alert.alert(
          'Google sign up failed',
          `${message}\n\nAdd this redirect URL in Supabase if needed:\n${oauthRedirectUri}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 justify-center">
      <Text className="text-stone-900 text-3xl font-semibold mb-2">Create account</Text>
      <Text className="text-stone-500 text-base mb-8">Start tracking your skin journey.</Text>
      <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} />

      <View className="flex-row items-center my-8">
        <View className="flex-1 h-px bg-stone-200" />
        <Text className="text-stone-400 mx-4 text-sm">or</Text>
        <View className="flex-1 h-px bg-stone-200" />
      </View>

      <PrimaryButton
        title="Continue with Google"
        variant="secondary"
        onPress={handleGoogleSignUp}
        disabled={loading}
      />

      <Link href="/(auth)/login" asChild>
        <Pressable className="mt-8 items-center">
          <Text className="text-stone-500">
            Have an account? <Text className="text-stone-800 font-medium">Sign in</Text>
          </Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}
