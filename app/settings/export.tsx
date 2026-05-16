import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PrimaryButton, ScreenHeader } from '@/components/ui';

export default function ExportSettings() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <ScreenHeader title="Data export" />
      <Card>
        <Text className="text-muted leading-6 mb-4">
          Export your photos, routine logs, and insights. Available in a future update for Supabase-connected accounts.
        </Text>
        <PrimaryButton title="Request export" onPress={() => {}} variant="secondary" />
      </Card>
    </SafeAreaView>
  );
}
