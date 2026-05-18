import { Image, Pressable, Text, View } from 'react-native';

interface TimelineCardProps {
  imageUrl: string;
  date: string;
  isBaseline?: boolean;
  multiAngle?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TimelineCard({
  imageUrl,
  date,
  isBaseline,
  multiAngle,
  selected,
  onPress,
  onLongPress,
}: TimelineCardProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} className="flex-1 m-1">
      <View
        className={`rounded-[20px] overflow-hidden aspect-[3/4] ${
          selected ? 'border-2 border-pink' : ''
        }`}
      >
        <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        {isBaseline ? (
          <View className="absolute top-2 left-2 bg-stone-800/70 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs">Baseline</Text>
          </View>
        ) : null}
        {multiAngle ? (
          <View className="absolute top-2 right-2 bg-stone-800/70 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs">3 views</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-stone-500 text-xs mt-1 text-center">{date}</Text>
    </Pressable>
  );
}
