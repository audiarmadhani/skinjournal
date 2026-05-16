import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, PrimaryButton } from '@/components/ui';
import {
  PROFILE_MAX_AGE,
  PROFILE_MIN_AGE,
  PROFILE_SEX_OPTIONS,
  parseProfileAge,
} from '@/constants/profile-demographics';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileSex } from '@/types';
import { data } from '@/services/data-provider';
import { useQueryClient } from '@tanstack/react-query';
import { showMessage } from '@/utils/confirm';

export function AgeSexEditorCard() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [ageInput, setAgeInput] = useState('');
  const [selectedSex, setSelectedSex] = useState<ProfileSex | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAgeInput(profile.age_years != null ? String(profile.age_years) : '');
    setSelectedSex(profile.sex);
  }, [profile]);

  const handleSave = async () => {
    const age = parseProfileAge(ageInput);
    if (age === null) {
      showMessage('Age', `Enter an age between ${PROFILE_MIN_AGE} and ${PROFILE_MAX_AGE}.`);
      return;
    }
    if (!selectedSex) {
      showMessage('Sex', 'Please select an option.');
      return;
    }
    setSaving(true);
    try {
      await data.updateProfile({ age_years: age, sex: selectedSex });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      showMessage('Saved', 'Your age and sex were updated.');
    } catch (e) {
      showMessage('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-5">
      <Text className="text-ink font-bold text-base mb-1">Age & sex</Text>
      <Text className="text-muted text-sm leading-5 mb-4">
        We use this to personalize routine tips and suggestions.
      </Text>
      <Text className="text-ink font-semibold text-sm mb-2">Age</Text>
      <TextInput
        value={ageInput}
        onChangeText={setAgeInput}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={3}
        placeholder={`${PROFILE_MIN_AGE}–${PROFILE_MAX_AGE}`}
        placeholderTextColor="#8A8580"
        className="bg-surface border border-stone-200 rounded-2xl px-4 py-3 mb-4 text-ink text-base"
      />
      <Text className="text-ink font-semibold text-sm mb-2">Sex</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {PROFILE_SEX_OPTIONS.map((opt) => {
          const selected = selectedSex === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setSelectedSex(opt.id)}
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
      <PrimaryButton
        title="Save"
        onPress={() => void handleSave()}
        loading={saving}
        disabled={saving}
      />
    </Card>
  );
}
