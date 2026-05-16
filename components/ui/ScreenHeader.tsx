import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: 'more' | 'none';
  onRightPress?: () => void;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightIcon = 'none',
  onRightPress,
}: ScreenHeaderProps) {
  const colors = useAppColors();

  return (
    <View className="flex-row items-center justify-between py-3 mb-2">
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
      <Text className="text-ink text-lg font-bold">{title}</Text>
      {rightIcon === 'more' ? (
        <Pressable
          onPress={onRightPress}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}
