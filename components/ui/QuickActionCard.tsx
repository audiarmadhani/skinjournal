import { Pressable, Text, View } from 'react-native';
import { PillTag } from './PillTag';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  tags: string[];
  emoji?: string;
  color: 'peach' | 'lavender' | 'mint';
  onPress?: () => void;
}

const BG = {
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  mint: 'bg-mint',
};

export function QuickActionCard({
  title,
  subtitle,
  tags,
  emoji = '✨',
  color,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${BG[color]} rounded-[24px] p-4 mr-3`}
      style={{ width: 168, minHeight: 160 }}
    >
      <Text className="text-2xl mb-3">{emoji}</Text>
      <Text className="text-ink font-bold text-base mb-1">{title}</Text>
      <Text className="text-muted text-xs leading-4 mb-4" numberOfLines={2}>
        {subtitle}
      </Text>
      <View className="flex-row flex-wrap gap-1.5 mt-auto">
        {tags.map((tag) => (
          <PillTag key={tag} label={tag} />
        ))}
      </View>
    </Pressable>
  );
}
