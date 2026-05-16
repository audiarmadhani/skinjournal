import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { RoutineProductForm } from '@/features/onboarding/components/RoutineProductForm';
import { validateRoutineBrands } from '@/features/onboarding/utils/validate-routine';
import { PrimaryButton } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function MorningOnboarding() {
  const {
    morningRoutine,
    toggleMorning,
    setMorningBrand,
    addMorningCustom,
  } = useOnboardingStore();
  const [custom, setCustom] = useState('');

  const handleContinue = () => {
    const error = validateRoutineBrands(morningRoutine);
    if (error) {
      Alert.alert('Add your brands', error);
      return;
    }
    router.push('/(onboarding)/night');
  };

  const handleAddCustom = () => {
    if (custom.trim()) {
      addMorningCustom(custom.trim());
      setCustom('');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={4} />
      <OnboardingStep
        headline="Morning routine"
        description="Choose each step you use, then enter the brand for that product."
      >
        <RoutineProductForm
          products={morningRoutine}
          onToggle={toggleMorning}
          onBrandChange={setMorningBrand}
          customName={custom}
          onCustomNameChange={setCustom}
          onAddCustom={handleAddCustom}
        />
      </OnboardingStep>
      <View className="px-6 pb-10">
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}
