import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoSlider, PrimaryButton } from '@/components/ui';
import { usePhoto } from '@/hooks/usePhotos';

export default function CompareScreen() {
  const { before, after } = useLocalSearchParams<{ before: string; after: string }>();
  const { data: beforePhoto } = usePhoto(before);
  const { data: afterPhoto } = usePhoto(after);

  if (!beforePhoto || !afterPhoto) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-4 items-center">
        <Text className="text-stone-900 text-xl font-semibold mb-6 self-start">Compare</Text>
        <PhotoSlider beforeUri={beforePhoto.image_url} afterUri={afterPhoto.image_url} />
        <Text className="text-stone-500 text-sm mt-4">Drag to compare</Text>
        <View className="flex-1" />
        <PrimaryButton title="Close" onPress={() => router.back()} className="w-full mb-6" />
      </View>
    </SafeAreaView>
  );
}
