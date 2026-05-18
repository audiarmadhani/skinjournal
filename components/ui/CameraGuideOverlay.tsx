import { Text, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { colors } from '@/lib/theme';
import {
  PHOTO_ANGLE_INSTRUCTIONS,
  PHOTO_ANGLE_LABELS,
  PHOTO_ANGLE_STEP_TOTAL,
  getAngleStepIndex,
} from '@/constants/photo-angles';
import type { PhotoAngle } from '@/types';

/** Shutter row height in capture.tsx (w-20 h-20). */
export const CAMERA_CAPTURE_CONTROLS_HEIGHT = 80;

interface CameraGuideOverlayProps {
  lightingQuality?: 'good' | 'fair' | 'poor';
  helperText?: string;
  angle?: PhotoAngle;
  /** Space reserved above bottom controls (px). */
  bottomReserved?: number;
  /** Hide step title copy when the screen header already shows it. */
  showStepHeader?: boolean;
}

export function CameraGuideOverlay({
  lightingQuality = 'fair',
  helperText,
  angle = 'front',
  bottomReserved = CAMERA_CAPTURE_CONTROLS_HEIGHT + 36,
  showStepHeader = true,
}: CameraGuideOverlayProps) {
  const lightingColors = {
    good: colors.pink,
    fair: '#E8B4C4',
    poor: '#A8A29E',
  };

  const stepIndex = getAngleStepIndex(angle);
  const instruction = helperText ?? PHOTO_ANGLE_INSTRUCTIONS[angle];
  const angleLabel = PHOTO_ANGLE_LABELS[angle];

  return (
    <View className="absolute inset-0 items-center justify-center pointer-events-none">
      {showStepHeader ? (
        <View className="absolute top-16 left-6 right-6 items-center">
          <Text className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">
            Photo {stepIndex} of {PHOTO_ANGLE_STEP_TOTAL}
          </Text>
          <Text className="text-white text-center text-xl font-bold mb-2">{angleLabel}</Text>
          <Text className="text-white text-center text-base font-medium">{instruction}</Text>
          <View className="flex-row gap-2 mt-4">
            {Array.from({ length: PHOTO_ANGLE_STEP_TOTAL }).map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${i < stepIndex ? 'w-8 bg-pink' : i === stepIndex - 1 ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
              />
            ))}
          </View>
        </View>
      ) : (
        <View className="absolute top-4 left-6 right-6 flex-row justify-center gap-2">
          {Array.from({ length: PHOTO_ANGLE_STEP_TOTAL }).map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${i < stepIndex ? 'w-8 bg-pink' : i === stepIndex - 1 ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
            />
          ))}
        </View>
      )}
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
