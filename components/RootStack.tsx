import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useAppColors } from '@/hooks/useAppColors';

export function RootStack() {
  const { colorScheme } = useColorScheme();
  const colors = useAppColors();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="camera/capture"
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen name="camera/preview" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="camera/result" options={{ presentation: 'modal' }} />
        <Stack.Screen name="photo/[id]" />
        <Stack.Screen name="routine/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="routine/manage" options={{ presentation: 'modal' }} />
        <Stack.Screen name="subscribe" options={{ presentation: 'modal' }} />
        <Stack.Screen name="timeline/compare" options={{ presentation: 'modal' }} />
        <Stack.Screen name="share/generate" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/export" />
        <Stack.Screen name="settings/appearance" />
      </Stack>
    </>
  );
}
