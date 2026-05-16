import { Text, View } from 'react-native';

interface ProductTagProps {
  name: string;
  brand?: string;
}

export function ProductTag({ name, brand }: ProductTagProps) {
  return (
    <View className="bg-stone-100 rounded-full px-3 py-1.5 mr-2 mb-2">
      <Text className="text-stone-700 text-sm">
        {name}
        {brand ? <Text className="text-stone-400"> · {brand}</Text> : null}
      </Text>
    </View>
  );
}
