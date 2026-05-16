import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ChipSelect } from '@/features/onboarding/components/ChipSelect';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import { SKIN_GOALS, useOnboardingStore } from '@/store/onboarding-store';

export default function GoalsOnboarding() {
  const { skinGoals, toggleGoal } = useOnboardingStore();

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={2} />
      <OnboardingStep headline="What are your skin goals?" description="Select all that apply.">
        <ChipSelect
          options={SKIN_GOALS}
          selected={skinGoals}
          onToggle={(id) => toggleGoal(id as typeof skinGoals[number])}
        />
      </OnboardingStep>
      <View className="px-6 pb-10">
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/concerns')} />
      </View>
    </View>
  );
}
