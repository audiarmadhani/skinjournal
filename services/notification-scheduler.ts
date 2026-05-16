import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_IDS = {
  eveningRoutine: 'evening-routine',
  photoReminder: 'photo-reminder',
  weeklySummary: 'weekly-summary',
  streakReminder: 'streak-reminder',
};

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDefaultNotifications(streakDay = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.eveningRoutine,
    content: {
      title: 'Evening routine',
      body: 'Time for your evening routine.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.photoReminder,
    content: {
      title: 'Daily photo',
      body: "Today's progress photo takes less than 10 seconds.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.weeklySummary,
    content: {
      title: 'Weekly summary',
      body: 'Your weekly skin summary is ready.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 10,
      minute: 0,
    },
  });

  if (streakDay > 0) {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.streakReminder,
      content: {
        title: 'Keep your journey going',
        body: `Day ${streakDay + 1} tomorrow. Keep your journey going.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 30,
      },
    });
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
