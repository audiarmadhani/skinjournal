import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PinkSwitch, ScreenHeader } from '@/components/ui';
import {
  scheduleDefaultNotifications,
  cancelAllNotifications,
} from '@/services/notification-scheduler';

export default function NotificationsSettings() {
  const [enabled, setEnabled] = useState(true);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    if (value) await scheduleDefaultNotifications(12);
    else await cancelAllNotifications();
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <ScreenHeader title="Notifications" />
      <Card className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-stone-800 font-medium">Reminders</Text>
          <Text className="text-stone-500 text-sm mt-1">
            Evening routine (7 PM), photo reminder (9 PM), weekly summary
          </Text>
        </View>
        <PinkSwitch value={enabled} onValueChange={toggle} />
      </Card>
    </SafeAreaView>
  );
}
