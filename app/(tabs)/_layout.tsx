import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/ui';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'visible',
          zIndex: 100,
          elevation: 100,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        },
        sceneContainerStyle: { paddingBottom: 96 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
      <Tabs.Screen name="camera" options={{ title: 'Camera' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
