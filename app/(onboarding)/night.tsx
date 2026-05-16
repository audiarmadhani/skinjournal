import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { RoutineProductForm } from '@/features/onboarding/components/RoutineProductForm';
import { validateRoutineBrands } from '@/features/onboarding/utils/validate-routine';
import { PrimaryButton } from '@/components/ui';
import { saveOnboardingRoutineProgress } from '@/services/onboarding-sync';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function NightOnboarding() {
  const { nightRoutine, toggleNight, setNightBrand, addNightCustom } = useOnboardingStore();
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const error = validateRoutineBrands(nightRoutine);
    if (error) {
      Alert.alert('Add your brands', error);
      return;
    }

    setLoading(true);
    try {
      const result = await saveOnboardingRoutineProgress();
      if (result === 'queued') {
        Alert.alert(
          'Saved on this device',
          'Sign in to sync your routine to your account. You can continue setup.'
        );
      }
      router.push('/(onboarding)/permissions');
    } catch (e) {
      Alert.alert(
        'Could not save routine',
        e instanceof Error ? e.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustom = () => {
    if (custom.trim()) {
      addNightCustom(custom.trim());
      setCustom('');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={5} />
      <OnboardingStep
        headline="Night routine"
        description="Select your evening steps and the brand you use for each."
      >
        <RoutineProductForm
          products={nightRoutine}
          onToggle={toggleNight}
          onBrandChange={setNightBrand}
          customName={custom}
          onCustomNameChange={setCustom}
          onAddCustom={handleAddCustom}
        />
      </OnboardingStep>
      <View className="px-6 pb-10">
        <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} disabled={loading} />
      </View>
    </View>
  );
}
