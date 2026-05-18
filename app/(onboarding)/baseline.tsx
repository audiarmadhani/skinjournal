import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { openCameraCapture } from '@/utils/camera-navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import { useCameraStore } from '@/store/camera-store';
import { skipBaselineOnboarding } from '@/services/onboarding-sync';
import { useQueryClient } from '@tanstack/react-query';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function BaselineOnboarding() {
  const { setIsBaseline } = useCameraStore();
  const queryClient = useQueryClient();

  const startBaseline = () => {
    track('baseline_started');
    setIsBaseline(true);
    openCameraCapture({ baseline: true });
  };

  const finishOnboarding = () => {
    track('baseline_skipped');
    track(AnalyticsEvents.onboardingCompleted, { method: 'skip' });
    skipBaselineOnboarding();
    void queryClient.invalidateQueries();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ProgressDots total={8} current={7} />
      <View className="flex-1 px-6 justify-center">
        <Text className="text-ink text-3xl font-bold mb-3">Take your baseline photos</Text>
        <Text className="text-muted text-base leading-6 mb-8">
          We&apos;ll guide you through three angles — front, left, and right — so you can track
          changes from every side. Use neutral expression, good lighting, and no filters.
        </Text>
        <PrimaryButton title="Start baseline capture" onPress={startBaseline} />
        <View className="h-3" />
        <PrimaryButton title="Skip for now" variant="ghost" onPress={finishOnboarding} />
      </View>
    </SafeAreaView>
  );
}
