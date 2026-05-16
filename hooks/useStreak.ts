import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: () => data.getStreak(),
  });
}
