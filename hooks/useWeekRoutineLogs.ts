import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';
import { getLast7DaysBounds } from '@/utils/weekly-summary';

export function useWeekRoutineLogs() {
  const { start, end } = getLast7DaysBounds();

  return useQuery({
    queryKey: ['routine', 'week', start, end],
    queryFn: () => data.getRoutineLogsBetween(start, end),
  });
}
