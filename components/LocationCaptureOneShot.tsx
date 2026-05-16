import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth-store';
import { captureAndPersistUserLocationOnce } from '@/services/user-location';

/** After login, attempts a single foreground location capture and saves it on the profile. */
export function LocationCaptureOneShot() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: profile, isSuccess } = useProfile(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !isSuccess || !profile) return;
    void captureAndPersistUserLocationOnce(queryClient, profile);
  }, [isAuthenticated, isSuccess, profile?.id, profile?.location_captured_at, queryClient]);

  return null;
}
