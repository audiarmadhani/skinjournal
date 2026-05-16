import { Text, View } from 'react-native';

export interface PillBarItem {
  label: string;
  value: number;
  color: string;
}

interface PillBarChartProps {
  items: PillBarItem[];
  maxHeight?: number;
}

export function PillBarChart({ items, maxHeight = 120 }: PillBarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <View className="flex-row justify-between items-end px-2" style={{ height: maxHeight + 48 }}>
      {items.map((item) => {
        const height = Math.max(24, (item.value / max) * maxHeight);
        return (
          <View key={item.label} className="flex-1 items-center mx-1">
            <View
              className="w-full rounded-full items-center justify-end pb-2"
              style={{ height, backgroundColor: item.color, maxWidth: 56 }}
            >
              <Text className="text-white text-xs font-bold">{item.value}%</Text>
            </View>
            <Text className="text-muted text-xs mt-2 font-medium">{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
