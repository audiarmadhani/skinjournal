import { useProfile } from '@/hooks/useProfile';
import { canAnalyzeFace, isPremiumProfile } from '@/lib/subscription';

export function usePremium() {
  const { data: profile, isLoading, refetch } = useProfile();

  return {
    profile,
    isLoading,
    isPremium: isPremiumProfile(profile),
    canAnalyzeFace: canAnalyzeFace(profile),
    refetch,
  };
}
