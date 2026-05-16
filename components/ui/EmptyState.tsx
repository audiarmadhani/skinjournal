import { Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-stone-800 text-xl font-semibold text-center mb-2">{title}</Text>
      <Text className="text-stone-500 text-center text-base leading-6 mb-6">{description}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} className="w-full" />
      ) : null}
    </View>
  );
}
