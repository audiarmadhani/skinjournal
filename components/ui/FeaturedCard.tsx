import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAppColors } from '@/hooks/useAppColors';

function SunIllustration({ pink, pinkEnd }: { pink: string; pinkEnd: string }) {
  return (
    <Svg width={120} height={80} viewBox="0 0 120 80">
      <Circle cx={60} cy={28} r={18} fill={pink} opacity={0.9} />
      <Path d="M20 65 Q60 45 100 65 L100 80 L20 80 Z" fill={pinkEnd} />
      <Path d="M35 70 Q60 58 85 70 L85 80 L35 80 Z" fill={pink} opacity={0.75} />
    </Svg>
  );
}

interface FeaturedCardProps {
  title: string;
  subtitle: string;
  cta: string;
  onPress?: () => void;
  variant?: 'pink' | 'lavender' | 'peach';
}

export function FeaturedCard({
  title,
  subtitle,
  cta,
  onPress,
  variant = 'pink',
}: FeaturedCardProps) {
  const colors = useAppColors();
  const gradientColors =
    variant === 'pink'
      ? ([colors.pinkGradientStart, colors.pinkGradientEnd] as const)
      : variant === 'lavender'
        ? ([colors.lavenderLight, colors.lavender] as const)
        : ([colors.peachLight, colors.peach] as const);

  return (
    <Pressable onPress={onPress} className="flex-1 mr-3" style={{ minWidth: 200 }}>
      <LinearGradient
        colors={gradientColors}
        style={{ borderRadius: 28, padding: 20, minHeight: 200, overflow: 'hidden' }}
      >
        <View className="absolute right-2 bottom-2 opacity-90">
          <SunIllustration pink={colors.pink} pinkEnd={colors.pinkGradientEnd} />
        </View>
        <View>
          <Text className="text-ink text-xl font-bold mb-1">{title}</Text>
          <Text className="text-muted text-sm leading-5 pr-16">{subtitle}</Text>
        </View>
        <Text className="text-ink font-semibold text-base mt-4">{cta} →</Text>
      </LinearGradient>
    </Pressable>
  );
}
