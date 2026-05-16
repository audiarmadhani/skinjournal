import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

/** Clear in-memory onboarding progress (e.g. on sign out). */
export function resetOnboardingSession(): void {
  useOnboardingStore.getState().reset();
}

/** Reset onboarding draft when the signed-in account changes. */
export function prepareOnboardingForUser(userId: string): void {
  const { activeUserId } = useOnboardingStore.getState();
  if (activeUserId !== userId) {
    useOnboardingStore.getState().reset();
    useOnboardingStore.setState({ activeUserId: userId });
  }
}

export function clearAuthAndOnboarding(): void {
  resetOnboardingSession();
  useAuthStore.getState().reset();
}
