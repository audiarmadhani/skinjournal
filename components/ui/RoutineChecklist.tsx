import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface RoutineItem {
  id: string;
  name: string;
  brand?: string;
  completed: boolean;
  disabled?: boolean;
  subtitle?: string;
}

interface RoutineChecklistProps {
  title: string;
  items: RoutineItem[];
  onToggle: (id: string) => void;
  compact?: boolean;
}

export function RoutineChecklist({ title, items, onToggle, compact }: RoutineChecklistProps) {
  return (
    <View className={compact ? '' : 'mb-4'}>
      {title ? <Text className="text-stone-500 text-sm font-medium mb-2">{title}</Text> : null}
      {items.map((item) => {
        const muted = item.disabled;
        return (
          <Pressable
            key={item.id}
            onPress={() => !item.disabled && onToggle(item.id)}
            disabled={item.disabled}
            className="flex-row items-center py-2"
            style={{ opacity: muted ? 0.55 : 1 }}
          >
            <View
              className={`w-6 h-6 rounded-lg border mr-3 items-center justify-center ${
                item.completed && !muted
                  ? 'bg-pink border-pink'
                  : 'border-stone-200 bg-surface'
              }`}
            >
              {item.completed && !muted ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : null}
            </View>
            <View className="flex-1">
              <Text
                className={`text-base ${
                  item.completed && !muted
                    ? 'text-stone-400 line-through'
                    : muted
                      ? 'text-muted'
                      : 'text-stone-800'
                }`}
              >
                {item.name}
              </Text>
              {item.brand ? (
                <Text
                  className={`text-sm mt-0.5 ${
                    muted ? 'text-muted' : item.completed ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {item.brand}
                </Text>
              ) : null}
              {item.subtitle && muted ? (
                <Text className="text-muted text-xs mt-0.5">{item.subtitle}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
