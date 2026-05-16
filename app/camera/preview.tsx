import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/ui';
import { useCameraStore } from '@/store/camera-store';
import { exitCameraFlow } from '@/utils/camera-navigation';
import { usePremium } from '@/hooks/usePremium';

export default function PreviewScreen() {
  const { captureUri, reset } = useCameraStore();
  const { canAnalyzeFace, isLoading } = usePremium();

  if (!captureUri) {
    router.back();
    return null;
  }

  const handleContinue = () => {
    if (canAnalyzeFace) {
      router.push('/camera/result?analyzing=true');
    } else {
      router.push('/camera/result?analyzing=false');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Pressable
        onPress={exitCameraFlow}
        className="absolute top-14 left-5 z-10 p-2"
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={26} color="#1A1A1A" />
      </Pressable>
      <Image source={{ uri: captureUri }} className="flex-1 mx-4 mt-4 rounded-3xl" resizeMode="cover" />
      <View className="px-6 py-6 gap-3">
        {!isLoading && !canAnalyzeFace ? (
          <Text className="text-muted text-center text-sm leading-5 px-2">
            Free plan saves your photo. Upgrade to Premium for AI face analysis.
          </Text>
        ) : null}
        <PrimaryButton
          title={canAnalyzeFace ? 'Analyze & save' : 'Save photo'}
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
        <PrimaryButton
          title="Retake"
          variant="ghost"
          onPress={() => {
            reset();
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
