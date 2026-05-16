import { Text, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { colors } from '@/lib/theme';

/** Shutter row height in capture.tsx (w-20 h-20). */
export const CAMERA_CAPTURE_CONTROLS_HEIGHT = 80;

interface CameraGuideOverlayProps {
  lightingQuality?: 'good' | 'fair' | 'poor';
  helperText?: string;
  /** Space reserved above bottom controls (px). */
  bottomReserved?: number;
}

export function CameraGuideOverlay({
  lightingQuality = 'fair',
  helperText = 'Try to use similar lighting each day.',
  bottomReserved = CAMERA_CAPTURE_CONTROLS_HEIGHT + 36,
}: CameraGuideOverlayProps) {
  const lightingColors = {
    good: colors.pink,
    fair: '#E8B4C4',
    poor: '#A8A29E',
  };

  return (
    <View className="absolute inset-0 items-center justify-center pointer-events-none">
      <View className="absolute top-16 left-6 right-6">
        <Text className="text-white text-center text-base font-medium drop-shadow">
          {helperText}
        </Text>
      </View>
      <Svg width={400} height={700} viewBox="0 0 380 700">
        <Ellipse
          cx={190}
          cy={280}
          rx={200}
          ry={280}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
          fill="none"
          strokeDasharray="8 6"
        />
      </Svg>
      <View className="absolute left-0 right-0 items-center px-6" style={{ bottom: bottomReserved }}>
        <Text className="text-white/90 text-sm text-center mb-4">
          Center face · Neutral expression · No filters · Good lighting
        </Text>
        <View className="flex-row items-center bg-pink-light/25 rounded-full px-4 py-2 border border-pink/30">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: lightingColors[lightingQuality] }}
          />
          <Text className="text-white text-sm capitalize">Lighting: {lightingQuality}</Text>
        </View>
      </View>
    </View>
  );
}
