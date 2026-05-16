import { Pressable, Text, View } from 'react-native';
import { todayISO, getWeekStripDates } from '@/utils/dates';

interface WeekCalendarStripProps {
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  /** ISO dates where the routine log is 100% complete */
  completedDates?: Set<string>;
  /** Break out of parent horizontal padding (e.g. px-5 → use 20) */
  bleedHorizontal?: number;
}

export function WeekCalendarStrip({
  selectedDate,
  onSelectDate,
  completedDates,
  bleedHorizontal = 20,
}: WeekCalendarStripProps) {
  const today = todayISO();
  const active = selectedDate ?? today;
  const week = getWeekStripDates();

  return (
    <View className="mb-6 self-stretch" style={{ marginHorizontal: -bleedHorizontal }}>
      <View className="flex-row w-full" style={{ paddingHorizontal: bleedHorizontal }}>
        {week.map((item) => {
          const isActive = item.date === active;
          const isFuture = item.date > today;
          const isComplete = completedDates?.has(item.date) ?? false;

          return (
            <Pressable
              key={item.date}
              onPress={() => onSelectDate?.(item.date)}
              className="flex-1 items-center"
            >
              <Text
                className={`text-xs mb-2 ${isActive ? 'text-ink font-semibold' : 'text-muted'}`}
              >
                {item.day}
              </Text>
              {isFuture ? (
                <View className="w-11 h-11 items-center justify-center">
                  <Text className="text-base font-semibold text-stone-400">{item.label}</Text>
                </View>
              ) : (
                <View
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    isComplete ? 'bg-pink-dark' : 'bg-pink-light'
                  }`}
                >
                  <Text className="text-base font-semibold text-ink">{item.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
