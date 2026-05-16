import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { data } from '@/services/data-provider';
import type { RoutineLog } from '@/types';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { useCalendarDay } from '@/hooks/useCalendarDay';
import { getLast7DaysBounds } from '@/utils/weekly-summary';

function normalizeLog(log: RoutineLog): RoutineLog {
  return {
    ...log,
    morning_completed: log.morning_completed ?? [],
    night_completed: log.night_completed ?? [],
  };
}

export function useTodayRoutine() {
  const queryClient = useQueryClient();
  const calendarDay = useCalendarDay();

  const routineQueryKey = ['routine', 'today', calendarDay] as const;

  const query = useQuery({
    queryKey: routineQueryKey,
    queryFn: async () => normalizeLog(await data.getTodayRoutine()),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: async (log: Partial<RoutineLog>) => {
      const result = await data.updateRoutine(log);
      return normalizeLog(result);
    },
    onMutate: async (partial) => {
      await queryClient.cancelQueries({ queryKey: routineQueryKey });
      const previous = queryClient.getQueryData<RoutineLog>(routineQueryKey);
      if (previous) {
        const optimistic = {
          ...previous,
          ...partial,
          morning_completed: partial.morning_completed ?? previous.morning_completed,
          night_completed: partial.night_completed ?? previous.night_completed,
        };
        queryClient.setQueryData(routineQueryKey, optimistic);

        const { start, end } = getLast7DaysBounds();
        const weekKey = ['routine', 'week', start, end] as const;
        const weekLogs = queryClient.getQueryData<RoutineLog[]>(weekKey);
        if (weekLogs) {
          const idx = weekLogs.findIndex((log) => log.date === optimistic.date);
          const next =
            idx >= 0
              ? weekLogs.map((log, i) => (i === idx ? optimistic : log))
              : [...weekLogs, optimistic];
          queryClient.setQueryData(weekKey, next);
        }
      }
      return { previous };
    },
    onError: (_err, _partial, context) => {
      if (context?.previous) {
        queryClient.setQueryData(routineQueryKey, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(routineQueryKey, data);
      void queryClient.invalidateQueries({ queryKey: ['streak'] });
      void queryClient.invalidateQueries({ queryKey: ['routine', 'week'] });
      track(AnalyticsEvents.routineCompleted);
    },
  });

  return { ...query, updateRoutine: mutation.mutateAsync, isSaving: mutation.isPending };
}
