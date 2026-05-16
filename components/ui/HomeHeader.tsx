import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

interface HomeHeaderProps {
  name: string;
  avatarUri?: string;
}

export function HomeHeader({ name, avatarUri }: HomeHeaderProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View className="flex-row justify-between items-center pt-5 pb-5 mb-2">
      <View>
        <Text className="text-muted text-lg">Hi,</Text>
        <Text className="text-ink text-4xl font-bold">{name}</Text>
      </View>
      <Pressable onPress={() => router.push('/(tabs)/profile')}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} className="w-16 h-16 rounded-full" />
        ) : (
          <View className="w-16 h-16 rounded-full bg-pink-light items-center justify-center border-2 border-white">
            <Text className="text-ink text-2xl font-bold">{initial}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
