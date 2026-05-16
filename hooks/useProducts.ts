import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      await syncPendingOnboardingIfNeeded();
      return data.getProducts();
    },
  });
}
