import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => data.getProfile(),
    enabled,
  });
}
