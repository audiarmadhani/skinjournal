import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';
import { useAuthStore } from '@/store/auth-store';
import type { AppSession } from '@/types/session';

export function useSession() {
  const { setAuthenticated, setLoading, isAuthenticated, isLoading, userId } = useAuthStore();

  const { data: session, isLoading: queryLoading } = useQuery<AppSession | null>({
    queryKey: ['session'],
    queryFn: async () => {
      const result = await data.getSession();
      if (!result) return null;
      if ('user' in result && result.user) {
        return {
          user: { id: result.user.id, email: result.user.email ?? undefined },
          access_token: 'access_token' in result ? result.access_token : undefined,
        };
      }
      return null;
    },
    retry: false,
  });

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
      return;
    }
    if (session?.user) {
      setAuthenticated(true, session.user.id);
    } else {
      setAuthenticated(false, null);
    }
  }, [session, queryLoading, setAuthenticated, setLoading]);

  return { session, isAuthenticated, isLoading, userId };
}
