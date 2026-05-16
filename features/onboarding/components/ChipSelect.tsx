import { Pressable, Text, View } from 'react-native';

interface ChipSelectProps {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function ChipSelect({ options, selected, onToggle }: ChipSelectProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            className={`rounded-full px-4 py-3 border ${
              isSelected ? 'bg-pink border-pink' : 'bg-surface border-stone-200'
            }`}
          >
            <Text className={isSelected ? 'text-ink font-bold' : 'text-stone-700'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
