import { useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/ui';
import { PHOTO_ANGLE_LABELS, PHOTO_ANGLE_ORDER } from '@/constants/photo-angles';
import type { PhotoAngle } from '@/types';
import { useCameraStore } from '@/store/camera-store';
import { requestExitCameraFlow } from '@/utils/camera-navigation';
import { usePremium } from '@/hooks/usePremium';

export default function PreviewScreen() {
  const { isSessionComplete, getCaptureUri } = useCameraStore();
  const { canAnalyzeFace, isLoading } = usePremium();

  useEffect(() => {
    if (!isSessionComplete()) {
      router.replace('/camera/capture');
    }
  }, [isSessionComplete]);

  if (!isSessionComplete()) {
    return null;
  }

  const handleContinue = () => {
    if (canAnalyzeFace) {
      router.push('/camera/result?analyzing=true');
    } else {
      router.push('/camera/result?analyzing=false');
    }
  };

  const retakeAngle = (angle: PhotoAngle) => {
    router.push(`/camera/capture?retake=${angle}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Pressable
        onPress={() => void requestExitCameraFlow()}
        className="absolute top-14 left-5 z-10 p-2"
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={26} color="#1A1A1A" />
      </Pressable>
      <ScrollView className="flex-1 px-4 mt-4" contentContainerClassName="pb-4">
        <Text className="text-ink text-2xl font-bold mb-1">Review your photos</Text>
        <Text className="text-muted text-sm mb-5">
          Front, left, and right — tap any photo to retake that angle.
        </Text>
        <View className="flex-row gap-2">
          {PHOTO_ANGLE_ORDER.map((angle) => {
            const uri = getCaptureUri(angle);
            return (
              <Pressable
                key={angle}
                onPress={() => retakeAngle(angle)}
                className="flex-1"
              >
                <Image
                  source={{ uri }}
                  className="w-full aspect-[3/4] rounded-2xl bg-stone-100"
                  resizeMode="cover"
                />
                <Text className="text-ink text-xs font-semibold text-center mt-2">
                  {PHOTO_ANGLE_LABELS[angle]}
                </Text>
                <Text className="text-pink-dark text-xs text-center">Retake</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="px-6 py-6 gap-3 border-t border-stone-100">
        {!isLoading && !canAnalyzeFace ? (
          <Text className="text-muted text-center text-sm leading-5 px-2">
            Free plan saves your journal entry. Upgrade to Premium for AI face analysis.
          </Text>
        ) : null}
        <PrimaryButton
          title={canAnalyzeFace ? 'Analyze & save' : 'Save journal entry'}
          onPress={handleContinue}
          disabled={isLoading}
        />
        {!canAnalyzeFace && !isLoading ? (
          <PrimaryButton
            title="Unlock face analysis"
            variant="secondary"
            onPress={() => router.push('/subscribe')}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
