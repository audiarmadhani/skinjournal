import { Text, View } from 'react-native';

interface RoutineLogProgressProps {
  completed: number;
  total: number;
  percent: number;
}

export function RoutineLogProgress({ completed, total, percent }: RoutineLogProgressProps) {
  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-ink text-2xl font-bold">{percent}%</Text>
        <Text className="text-muted text-sm">
          {completed} of {total} steps logged
        </Text>
      </View>
      <View className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
        <View className="h-full bg-pink rounded-full" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
