import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({ title, actionLabel, onAction, className = '' }: SectionHeaderProps) {
  const colors = useAppColors();

  return (
    <View className={`flex-row justify-between items-center mb-4 ${className}`}>
      <Text className="text-ink text-xl font-bold">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="flex-row items-center">
          <Text className="text-muted text-sm mr-1">{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}
