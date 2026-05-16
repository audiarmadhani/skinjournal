import { Pressable, Text, TextInput, View } from 'react-native';
import { MAX_USAGE_INTERVAL, MIN_USAGE_INTERVAL } from '@/types/database';

const PRESETS = [1, 2, 3, 4, 7, 14] as const;

type UsageIntervalPickerProps = {
  value: string;
  onChangeValue: (text: string) => void;
  error?: string | null;
};

export function UsageIntervalPicker({ value, onChangeValue, error }: UsageIntervalPickerProps) {
  return (
    <View>
      <Text className="text-muted text-sm mb-2">Use every</Text>
      <View className="flex-row items-center gap-2 mb-3">
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          keyboardType="number-pad"
          maxLength={2}
          className="flex-1 bg-surface border border-stone-200 rounded-2xl px-4 py-3 text-ink text-center text-lg font-semibold"
          placeholder="1"
          placeholderTextColor="#8A8580"
        />
        <Text className="text-ink text-base">days</Text>
      </View>
      <View className="flex-row flex-wrap gap-2 mb-1">
        {PRESETS.map((preset) => {
          const active = value === String(preset);
          const label = preset === 1 ? 'Daily' : String(preset);
          return (
            <Pressable
              key={preset}
              onPress={() => onChangeValue(String(preset))}
              className={`px-3 py-2 rounded-full border ${
                active ? 'bg-pink border-pink' : 'bg-surface border-stone-200'
              }`}
            >
              <Text className={`text-sm font-medium ${active ? 'text-ink' : 'text-muted'}`}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-muted text-xs">
        Between {MIN_USAGE_INTERVAL} and {MAX_USAGE_INTERVAL} days. Schedule repeats from the product
        start date.
      </Text>
      {error ? <Text className="text-pink-dark text-sm mt-2">{error}</Text> : null}
    </View>
  );
}
