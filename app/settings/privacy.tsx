import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ScreenHeader } from '@/components/ui';

export default function PrivacySettings() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <ScreenHeader title="Privacy" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text className="text-stone-800 leading-6">
            Your photos and data are stored securely. We never share your images with third parties.
            Insights are observational only and not medical advice.
          </Text>
        </Card>
        <Text className="text-stone-900 text-2xl font-semibold mt-8 mb-4">About</Text>
        <Card>
          <Text className="text-muted">SkinJournal v1.0.0</Text>
          <Text className="text-stone-500 text-sm mt-2">Track your skin journey with consistency.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
