import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ChipSelect } from '@/features/onboarding/components/ChipSelect';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import { CONCERNS, useOnboardingStore } from '@/store/onboarding-store';

export default function ConcernsOnboarding() {
  const { concerns, toggleConcern } = useOnboardingStore();

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={3} />
      <OnboardingStep headline="Current concerns" description="What would you like to focus on?">
        <ChipSelect
          options={CONCERNS.map((c) => ({ id: c, label: c }))}
          selected={concerns}
          onToggle={toggleConcern}
        />
      </OnboardingStep>
      <View className="px-6 pb-10">
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/morning')} />
      </View>
    </View>
  );
}
