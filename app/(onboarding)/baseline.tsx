import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressDots } from '@/features/onboarding/components/ProgressDots';
import { PrimaryButton } from '@/components/ui';
import { useCameraStore } from '@/store/camera-store';
import { skipBaselineOnboarding } from '@/services/onboarding-sync';
import { useQueryClient } from '@tanstack/react-query';

export default function BaselineOnboarding() {
  const { setIsBaseline } = useCameraStore();
  const queryClient = useQueryClient();

  const startBaseline = () => {
    setIsBaseline(true);
    router.push('/camera/capture?baseline=true');
  };

  const finishOnboarding = () => {
    skipBaselineOnboarding();
    void queryClient.invalidateQueries();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ProgressDots total={8} current={7} />
      <View className="flex-1 px-6 justify-center">
        <Text className="text-ink text-3xl font-bold mb-3">Take your baseline photo</Text>
        <Text className="text-muted text-base leading-6 mb-8">
          This is your starting point. Center your face, use neutral expression, good lighting, and no
          filters. You can add one later from Home.
        </Text>
        <PrimaryButton title="Open camera" onPress={startBaseline} />
        <View className="h-3" />
        <PrimaryButton title="Skip for now" variant="ghost" onPress={finishOnboarding} />
      </View>
    </SafeAreaView>
  );
}
