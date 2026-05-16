import { View } from 'react-native';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View className="flex-row justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 rounded-full ${
            i === current ? 'w-6 bg-pink' : i < current ? 'w-1.5 bg-pink/60' : 'w-1.5 bg-stone-200'
          }`}
        />
      ))}
    </View>
  );
}
