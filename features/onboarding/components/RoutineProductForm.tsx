import { Pressable, Text, TextInput, View } from 'react-native';
import type { RoutineProductDraft } from '@/types/routine';

interface RoutineProductFormProps {
  products: RoutineProductDraft[];
  onToggle: (name: string) => void;
  onBrandChange: (name: string, brand: string) => void;
  customName: string;
  onCustomNameChange: (value: string) => void;
  onAddCustom: () => void;
}

export function RoutineProductForm({
  products,
  onToggle,
  onBrandChange,
  customName,
  onCustomNameChange,
  onAddCustom,
}: RoutineProductFormProps) {
  return (
    <View className="gap-3">
      {products.map((product) => {
        const isSelected = product.selected;
        return (
          <View
            key={product.name}
            className={`rounded-2xl border px-4 py-3 ${
              isSelected ? 'border-pink bg-surface' : 'border-stone-200 bg-surface/60'
            }`}
          >
            <Pressable onPress={() => onToggle(product.name)} className="flex-row items-center">
              <View
                className={`w-5 h-5 rounded-md border mr-3 items-center justify-center ${
                  isSelected ? 'bg-pink border-pink' : 'border-stone-300'
                }`}
              >
                {isSelected ? <Text className="text-ink text-xs font-bold">✓</Text> : null}
              </View>
              <Text className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-stone-500'}`}>
                {product.name}
              </Text>
            </Pressable>
            {isSelected ? (
              <TextInput
                value={product.brand}
                onChangeText={(text) => onBrandChange(product.name, text)}
                placeholder="Brand (e.g. CeraVe, La Roche-Posay)"
                placeholderTextColor="#A8A29E"
                className="mt-3 bg-background border border-stone-200 rounded-xl px-4 py-3 text-ink"
                autoCapitalize="words"
              />
            ) : null}
          </View>
        );
      })}

      <View className="flex-row gap-2 mt-2">
        <TextInput
          value={customName}
          onChangeText={onCustomNameChange}
          placeholder="Other step (e.g. Eye cream)"
          placeholderTextColor="#A8A29E"
          onSubmitEditing={onAddCustom}
          className="flex-1 bg-surface border border-stone-200 rounded-2xl px-4 py-3 text-ink"
        />
        <Pressable
          onPress={onAddCustom}
          className="bg-pink rounded-2xl px-4 justify-center"
        >
          <Text className="text-ink font-bold">Add</Text>
        </Pressable>
      </View>
    </View>
  );
}
