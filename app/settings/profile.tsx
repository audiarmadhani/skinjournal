import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AgeSexEditorCard } from '@/components/profile/AgeSexEditorCard';
import { ScreenHeader } from '@/components/ui';

export default function ProfileSettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <ScreenHeader title="Profile" />
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <AgeSexEditorCard />
      </ScrollView>
    </SafeAreaView>
  );
}
