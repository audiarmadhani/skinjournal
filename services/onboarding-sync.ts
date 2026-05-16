import { getSupabase } from '@/lib/supabase';
import { getSelectedRoutineProducts } from '@/features/onboarding/utils/validate-routine';
import { useOnboardingStore } from '@/store/onboarding-store';
import { data } from './data-provider';
import { persistOnboardingRoutine } from './routine-products';

export async function isAuthenticated(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;
  const { data: session } = await supabase.auth.getSession();
  return Boolean(session.session?.user);
}

function hasOnboardingRoutineDrafts(): boolean {
  const { morningRoutine, nightRoutine } = useOnboardingStore.getState();
  return (
    getSelectedRoutineProducts(morningRoutine).length > 0 ||
    getSelectedRoutineProducts(nightRoutine).length > 0
  );
}

/** Save routine + profile fields from onboarding store. */
async function persistFromStore(markComplete: boolean): Promise<void> {
  const { skinGoals, concerns, morningRoutine, nightRoutine, ageYears, sex } =
    useOnboardingStore.getState();
  await data.ensureProfile();
  await persistOnboardingRoutine({
    skinGoals,
    concerns,
    morningRoutine,
    nightRoutine,
    ageYears,
    sex,
    markComplete,
  });
}

/** Push onboarding routine to Supabase only when a prior sync was queued (not when list is empty). */
export async function syncPendingOnboardingIfNeeded(): Promise<boolean> {
  const { pendingServerSync, localOnboardingComplete, setPendingServerSync } =
    useOnboardingStore.getState();

  if (!pendingServerSync) return false;
  if (!(await isAuthenticated())) return false;

  try {
    await persistFromStore(localOnboardingComplete);
    setPendingServerSync(false);
    clearRoutineDraftsFromStore();
    return true;
  } catch {
    setPendingServerSync(true);
    return false;
  }
}

/** Prevent in-memory onboarding defaults from re-populating an empty product list. */
function clearRoutineDraftsFromStore(): void {
  const { morningRoutine, nightRoutine } = useOnboardingStore.getState();
  useOnboardingStore.setState({
    morningRoutine: morningRoutine.map((p) => ({ ...p, selected: false })),
    nightRoutine: nightRoutine.map((p) => ({ ...p, selected: false })),
  });
}

/** Save routine after night step (before baseline / permissions finish). */
export async function saveOnboardingRoutineProgress(): Promise<'saved' | 'queued'> {
  const { setPendingServerSync } = useOnboardingStore.getState();

  if (!hasOnboardingRoutineDrafts()) return 'saved';
  if (!(await isAuthenticated())) {
    setPendingServerSync(true);
    return 'queued';
  }

  try {
    await persistFromStore(false);
    setPendingServerSync(false);
    return 'saved';
  } catch {
    setPendingServerSync(true);
    return 'queued';
  }
}

/** Skip baseline photo and finish onboarding without blocking navigation. */
export function skipBaselineOnboarding(): void {
  const { setPendingServerSync, setLocalOnboardingComplete } = useOnboardingStore.getState();
  setLocalOnboardingComplete(true);

  void (async () => {
    if (!(await isAuthenticated())) {
      setPendingServerSync(true);
      return;
    }
    try {
      await data.updateProfile({ onboarding_completed: true });
      await persistFromStore(true);
      setPendingServerSync(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Not authenticated') || message.includes('JWT')) {
        setPendingServerSync(true);
        return;
      }
      try {
        await data.updateProfile({ onboarding_completed: true });
      } catch {
        setPendingServerSync(true);
      }
    }
  })();
}

/** Finish onboarding — sync now or queue for when auth is ready. */
export async function completeOnboardingFlow(): Promise<'synced' | 'queued'> {
  const { setPendingServerSync, setLocalOnboardingComplete } = useOnboardingStore.getState();

  if (!(await isAuthenticated())) {
    setPendingServerSync(true);
    setLocalOnboardingComplete(true);
    return 'queued';
  }

  try {
    await persistFromStore(true);
    setPendingServerSync(false);
    setLocalOnboardingComplete(true);
    clearRoutineDraftsFromStore();
    return 'synced';
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Not authenticated') || message.includes('JWT')) {
      setPendingServerSync(true);
      setLocalOnboardingComplete(true);
      return 'queued';
    }
    throw error;
  }
}
