import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => data.getInsights(),
  });
}

export { useProducts } from './useProducts';
