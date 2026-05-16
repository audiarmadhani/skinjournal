import { Pressable, Text, View } from 'react-native';
import { RoutineChecklist, type RoutineItem } from '@/components/ui/RoutineChecklist';

interface RoutineLogSectionProps {
  title: string;
  emoji: string;
  dueItems: RoutineItem[];
  notDueItems: RoutineItem[];
  onToggle: (id: string) => void;
  onMarkAll: () => void;
  disabled?: boolean;
}

export function RoutineLogSection({
  title,
  emoji,
  dueItems,
  notDueItems,
  onToggle,
  onMarkAll,
  disabled,
}: RoutineLogSectionProps) {
  const allDone = dueItems.length > 0 && dueItems.every((i) => i.completed);
  const hasAny = dueItems.length > 0 || notDueItems.length > 0;

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-ink font-bold text-lg">
          {emoji} {title}
        </Text>
        {dueItems.length > 0 && !allDone ? (
          <Pressable onPress={onMarkAll} disabled={disabled}>
            <Text className="text-muted text-sm font-medium">Mark all done</Text>
          </Pressable>
        ) : null}
      </View>
      {!hasAny ? (
        <Text className="text-muted text-sm">No {title.toLowerCase()} steps yet.</Text>
      ) : (
        <>
          {dueItems.length > 0 ? (
            <RoutineChecklist title="" items={dueItems} onToggle={onToggle} />
          ) : (
            <Text className="text-muted text-sm mb-2">Nothing due today.</Text>
          )}
          {notDueItems.length > 0 ? (
            <View className="mt-3 pt-3 border-t border-stone-100">
              <Text className="text-muted text-xs font-medium uppercase tracking-wide mb-2">
                Not due today
              </Text>
              <RoutineChecklist title="" items={notDueItems} onToggle={onToggle} />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
