import { Pressable, View } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';

type PinkSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;

export function PinkSwitch({ value, onValueChange, disabled }: PinkSwitchProps) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT, opacity: disabled ? 0.5 : 1 }}
    >
      <View
        className="rounded-full justify-center"
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          backgroundColor: value ? colors.pink : colors.border,
          padding: 2,
        }}
      >
        <View
          className="rounded-full bg-surface"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            alignSelf: value ? 'flex-end' : 'flex-start',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>
    </Pressable>
  );
}
