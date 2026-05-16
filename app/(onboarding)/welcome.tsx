import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { useOnboardingStore } from '@/store/onboarding-store';
import { data } from '@/services/data-provider';
import { clearAuthAndOnboarding } from '@/services/onboarding-session';
import { useQueryClient } from '@tanstack/react-query';

export default function WelcomeOnboarding() {
  const { setStep } = useOnboardingStore();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const email = session?.user?.email;

  const handleSwitchAccount = async () => {
    await data.signOut();
    clearAuthAndOnboarding();
    queryClient.clear();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={0} />
      <OnboardingStep
        headline="See your progress over time."
        description="Take daily photos, track routines, and receive insights based on your journey."
      >
        <View className="bg-surface border border-stone-200 rounded-2xl px-4 py-4">
          <Text className="text-muted text-sm mb-1">Signed in as</Text>
          <Text className="text-ink font-semibold text-base mb-3">
            {email ?? 'Your account'}
          </Text>
          <Pressable onPress={handleSwitchAccount}>
            <Text className="text-ink font-medium text-sm underline">
              Use a different account
            </Text>
          </Pressable>
        </View>
      </OnboardingStep>
      <View className="px-6 pb-10 gap-3">
        <PrimaryButton
          title="Continue"
          onPress={() => {
            setStep(1);
            router.push('/(onboarding)/demographics');
          }}
        />
        <Pressable onPress={handleSwitchAccount} className="items-center py-2">
          <Text className="text-muted text-sm">Not you? Sign in with another account</Text>
        </Pressable>
      </View>
    </View>
  );
}
