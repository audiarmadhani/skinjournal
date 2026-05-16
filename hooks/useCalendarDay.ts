import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { todayISO } from '@/utils/dates';

/** Reactive ISO calendar date for TanStack keys — bumps after midnight or when app/tab becomes visible. */
export function useCalendarDay(): string {
  const [day, setDay] = useState(todayISO);

  useEffect(() => {
    const sync = () => {
      const current = todayISO();
      setDay((prev) => (prev !== current ? current : prev));
    };

    sync();

    const intervalId = setInterval(sync, 30_000);

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') sync();
    });

    const visibilityCallback =
      typeof document !== 'undefined'
        ? () => {
            if (document.visibilityState === 'visible') sync();
          }
        : null;
    if (visibilityCallback) {
      document.addEventListener('visibilitychange', visibilityCallback);
    }

    return () => {
      clearInterval(intervalId);
      sub.remove();
      if (visibilityCallback) {
        document.removeEventListener('visibilitychange', visibilityCallback);
      }
    };
  }, []);

  return day;
}
