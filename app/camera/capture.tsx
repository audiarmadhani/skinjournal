import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraGuideOverlay, PrimaryButton, ScreenHeader } from '@/components/ui';
import {
  PHOTO_ANGLE_INSTRUCTIONS,
  PHOTO_ANGLE_LABELS,
  PHOTO_ANGLE_STEP_TOTAL,
  getAngleStepIndex,
  getNextAngle,
} from '@/constants/photo-angles';
import { useCameraStore } from '@/store/camera-store';
import { requestExitCameraFlow } from '@/utils/camera-navigation';
import { pauseTabSlideAnimations } from '@/store/tab-slide-store';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';

export default function CaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { baseline, retake } = useLocalSearchParams<{ baseline?: string; retake?: string }>();
  const {
    currentAngle,
    setCaptureForAngle,
    setCurrentAngle,
    setIsBaseline,
    setLightingQuality,
    lightingQuality,
  } = useCameraStore();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  useEffect(() => {
    pauseTabSlideAnimations();
  }, []);

  useEffect(() => {
    setIsBaseline(baseline === 'true');
    if (retake && (retake === 'front' || retake === 'left' || retake === 'right')) {
      setCurrentAngle(retake);
    }
  }, [baseline, retake, setCurrentAngle, setIsBaseline]);

  const handleBack = () => {
    void requestExitCameraFlow();
  };

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (!photo?.uri) return;

    const angle = currentAngle;
    setCaptureForAngle(angle, photo.uri);
    setLightingQuality('good');

    const next = getNextAngle(angle);
    if (next) {
      setCurrentAngle(next);
      return;
    }
    router.push('/camera/preview');
  };

  const stepLabel = `Step ${getAngleStepIndex(currentAngle)} of ${PHOTO_ANGLE_STEP_TOTAL}`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5">
        <ScreenHeader
          title={baseline === 'true' ? 'Baseline photos' : 'Journal photos'}
          onBackPress={handleBack}
        />

        <Text className="text-muted text-base -mt-2 mb-1">
          {PHOTO_ANGLE_LABELS[currentAngle]} · {stepLabel}
        </Text>
        <Text className="text-muted text-sm leading-5 mb-4">
          {PHOTO_ANGLE_INSTRUCTIONS[currentAngle]}
        </Text>

        {!permission?.granted ? (
          <View className="flex-1 rounded-3xl bg-surface border border-stone-200/80 items-center justify-center px-6 mb-4">
            <Text className="text-ink text-center text-base leading-6 mb-6">
              Camera access is needed for your three-angle journal photos.
            </Text>
            <PrimaryButton title="Grant permission" onPress={requestPermission} />
          </View>
        ) : (
          <View className="flex-1 rounded-3xl overflow-hidden bg-black mb-4">
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
              <CameraGuideOverlay
                angle={currentAngle}
                lightingQuality={lightingQuality}
                bottomReserved={48}
                showStepHeader={false}
              />
            </CameraView>
          </View>
        )}

        {permission?.granted ? (
          <View
            className="flex-row items-center justify-center"
            style={{ paddingBottom: Math.max(insets.bottom, 8) }}
          >
            <Pressable
              onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
              hitSlop={8}
              className="w-12 h-12 rounded-full bg-surface border border-stone-200/80 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <Ionicons name="camera-reverse-outline" size={24} color={colors.ink} />
            </Pressable>
            <Pressable
              onPress={takePicture}
              className="w-20 h-20 rounded-full border-4 border-pink items-center justify-center mx-10"
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <View className="w-16 h-16 rounded-full bg-pink" />
            </Pressable>
            <View className="w-12" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
