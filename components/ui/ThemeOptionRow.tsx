import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';

type ThemeOptionRowProps = {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
};

export function ThemeOptionRow({
  label,
  description,
  selected,
  onPress,
  isLast,
}: ThemeOptionRowProps) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-4 ${isLast ? '' : 'border-b border-stone-200'}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View className="flex-1 pr-3">
        <Text className="text-stone-800 font-medium">{label}</Text>
        <Text className="text-stone-500 text-sm mt-1">{description}</Text>
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.pinkDark} />
      ) : (
        <View className="w-6 h-6 rounded-full border-2 border-stone-300" />
      )}
    </Pressable>
  );
}
