import { Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingStep } from '@/features/onboarding/components/OnboardingStep';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton, Card } from '@/components/ui';
import {
  requestNotificationPermissions,
  scheduleDefaultNotifications,
} from '@/services/notification-scheduler';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Ionicons } from '@expo/vector-icons';

const PERMISSIONS = [
  { icon: 'camera-outline' as const, title: 'Camera', desc: 'For daily progress photos' },
  { icon: 'notifications-outline' as const, title: 'Notifications', desc: 'Gentle routine reminders' },
  { icon: 'images-outline' as const, title: 'Photo storage', desc: 'Save and export your journey' },
];

export default function PermissionsOnboarding() {
  const { setPermissionsGranted } = useOnboardingStore();

  const requestAll = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    const notif = await requestNotificationPermissions();
    if (notif) await scheduleDefaultNotifications();
    setPermissionsGranted(true);
    router.push('/(onboarding)/baseline');
  };

  return (
    <View className="flex-1 bg-background">
      <ProgressDots total={8} current={6} />
      <OnboardingStep headline="Permissions" description="We only ask for what helps your journey.">
        {PERMISSIONS.map((p) => (
          <Card key={p.title} className="flex-row items-center mb-3 py-4">
            <Ionicons name={p.icon} size={24} color="#78716C" />
            <View className="ml-4 flex-1">
              <Text className="text-stone-800 font-medium">{p.title}</Text>
              <Text className="text-stone-500 text-sm">{p.desc}</Text>
            </View>
          </Card>
        ))}
      </OnboardingStep>
      <View className="px-6 pb-10 gap-3">
        <PrimaryButton title="Allow permissions" onPress={requestAll} />
        <PrimaryButton title="Skip for now" variant="ghost" onPress={() => router.push('/(onboarding)/baseline')} />
      </View>
    </View>
  );
}
