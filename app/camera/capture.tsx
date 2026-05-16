import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraGuideOverlay, CAMERA_CAPTURE_CONTROLS_HEIGHT } from '@/components/ui';
import { useCameraStore } from '@/store/camera-store';
import { exitCameraFlow } from '@/utils/camera-navigation';
import { Ionicons } from '@expo/vector-icons';

export default function CaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { baseline } = useLocalSearchParams<{ baseline?: string }>();
  const { setCaptureUri, setIsBaseline, setLightingQuality, lightingQuality } = useCameraStore();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const insets = useSafeAreaInsets();

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCaptureUri(result.assets[0].uri);
      setIsBaseline(baseline === 'true');
      setLightingQuality('fair');
      router.push('/camera/preview');
    }
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#141014]">
        <Pressable
          onPress={exitCameraFlow}
          className="p-4 self-start"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-center mb-6">Camera access is needed for progress photos.</Text>
          <Pressable onPress={requestPermission} className="bg-white px-6 py-3 rounded-2xl">
            <Text className="text-stone-900 font-medium">Grant permission</Text>
          </Pressable>
          <Pressable onPress={pickFromLibrary} className="mt-4">
            <Text className="text-stone-400">Use photo library instead</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setCaptureUri(photo.uri);
      setIsBaseline(baseline === 'true');
      setLightingQuality('good');
      router.push('/camera/preview');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        <CameraGuideOverlay
          lightingQuality={lightingQuality}
          bottomReserved={Math.max(insets.bottom, 12) + CAMERA_CAPTURE_CONTROLS_HEIGHT + 28}
        />
      </CameraView>
      <SafeAreaView className="absolute inset-0 justify-between" pointerEvents="box-none">
        <Pressable
          onPress={exitCameraFlow}
          className="p-4 self-start"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          style={{ zIndex: 20 }}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <View
          className="absolute left-0 right-0 items-center"
          style={{ bottom: Math.max(insets.bottom, 12), zIndex: 10 }}
          pointerEvents="box-none"
        >
          <View className="flex-row items-center gap-8 mb-2">
            <Pressable onPress={pickFromLibrary} hitSlop={8}>
              <Ionicons name="images-outline" size={28} color="#fff" />
            </Pressable>
            <Pressable
              onPress={takePicture}
              className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </Pressable>
            <Pressable
              onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
              hitSlop={8}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
