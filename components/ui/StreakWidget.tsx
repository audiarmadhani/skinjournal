import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PillTag } from './PillTag';
import { useAppColors } from '@/hooks/useAppColors';
import { radii } from '@/lib/theme';

interface StreakWidgetProps {
  days: number;
}

export function StreakWidget({ days }: StreakWidgetProps) {
  const colors = useAppColors();

  return (
    <View
      className="mb-2 self-stretch"
      style={{ borderRadius: radii.card, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={[colors.pinkGradientStart, colors.pinkGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="p-5">
          <View className="flex-row items-center justify-between mb-3">
            <PillTag label="Streak" variant="dark" />
            <Text style={{ fontSize: 32, lineHeight: 38 }}>🔥</Text>
          </View>
          <Text className="text-ink font-bold" style={{ fontSize: 36, lineHeight: 42 }}>
            {days}
          </Text>
          <Text className="text-muted text-sm mt-1" style={{ lineHeight: 20 }}>
            day{days === 1 ? '' : 's'} consistent
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
