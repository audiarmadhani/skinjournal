import { useRef } from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/ui';
import { setTabSlideDirection } from '@/store/tab-slide-store';

export default function TabLayout() {
  const prevIndexRef = useRef<number | null>(null);
  const skipInitialRef = useRef(true);

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenListeners={{
        state: (e) => {
          const idx = e.data.state.index;
          if (skipInitialRef.current) {
            skipInitialRef.current = false;
            prevIndexRef.current = idx;
            return;
          }
          if (prevIndexRef.current !== null && prevIndexRef.current !== idx) {
            setTabSlideDirection(prevIndexRef.current, idx);
          }
          prevIndexRef.current = idx;
        },
      }}
      screenOptions={{
        headerShown: false,
        lazy: false,
        detachInactiveScreens: false,
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
        sceneContainerStyle: { paddingBottom: 96, overflow: 'visible' },
        sceneStyle: { backgroundColor: 'transparent', overflow: 'visible' },
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
