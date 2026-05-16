import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import {
  PROFILE_MAX_AGE,
  PROFILE_MIN_AGE,
  PROFILE_SEX_OPTIONS,
  parseProfileAge,
} from '@/constants/profile-demographics';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function DemographicsOnboarding() {
  const { sex, setStep, setAgeYears, setSex } = useOnboardingStore();
  const [ageInput, setAgeInput] = useState(() => {
    const y = useOnboardingStore.getState().ageYears;
    return y != null ? String(y) : '';
  });

  const handleContinue = () => {
    const age = parseProfileAge(ageInput);
    if (age === null) {
      Alert.alert('Age', `Please enter your age (${PROFILE_MIN_AGE}–${PROFILE_MAX_AGE}).`);
      return;
    }
    if (!sex) {
      Alert.alert('Sex', 'Please select an option.');
      return;
    }
    setAgeYears(age);
    setStep(2);
    router.push('/(onboarding)/goals');
  };

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={1} />
      <OnboardingStep
        headline="A bit about you"
        description={
          'We ask for your age and sex so SkinJournal can tailor routine tips and suggestions to you.'
        }
      >
        <Text className="text-ink font-semibold text-base mb-2">Age</Text>
        <TextInput
          value={ageInput}
          onChangeText={setAgeInput}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={3}
          placeholder={`${PROFILE_MIN_AGE}–${PROFILE_MAX_AGE}`}
          placeholderTextColor="#8A8580"
          className="bg-surface border border-stone-200 rounded-2xl px-4 py-3 mb-8 text-ink text-base"
        />

        <Text className="text-ink font-semibold text-base mb-2">Sex</Text>
        <View className="flex-row flex-wrap gap-2 mb-2">
          {PROFILE_SEX_OPTIONS.map((opt) => {
            const selected = sex === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSex(opt.id)}
                className={`rounded-full px-4 py-3 border ${
                  selected ? 'bg-pink border-pink' : 'bg-surface border-stone-200'
                }`}
              >
                <Text className={selected ? 'text-ink font-bold' : 'text-stone-700'}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </OnboardingStep>
      <View className="px-6 pb-10">
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}
