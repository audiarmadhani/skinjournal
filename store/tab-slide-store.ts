import { create } from 'zustand';

export const TAB_ROUTE_ORDER = ['index', 'timeline', 'camera', 'insights', 'profile'] as const;

export type TabRouteName = (typeof TAB_ROUTE_ORDER)[number];

export type TabSlideDirection = 'fromRight' | 'fromLeft';

interface TabSlideState {
  direction: TabSlideDirection;
  /** True while a root overlay (e.g. camera sheet) is open — tabs stay static. */
  suppressAnimations: boolean;
  setDirection: (fromIndex: number, toIndex: number) => void;
  pauseAnimations: () => void;
  resumeAnimations: () => void;
}

export function tabIndexForRoute(name: string): number {
  const idx = TAB_ROUTE_ORDER.indexOf(name as TabRouteName);
  return idx >= 0 ? idx : 0;
}

/** Update slide direction from tab bar indices (right on bar = enter from right). */
export function setTabSlideDirection(fromIndex: number, toIndex: number): void {
  useTabSlideStore.getState().setDirection(fromIndex, toIndex);
}

export function pauseTabSlideAnimations(): void {
  useTabSlideStore.getState().pauseAnimations();
}

export function resumeTabSlideAnimations(): void {
  useTabSlideStore.getState().resumeAnimations();
}

export const useTabSlideStore = create<TabSlideState>((set) => ({
  direction: 'fromRight',
  suppressAnimations: false,
  setDirection: (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set({ direction: toIndex > fromIndex ? 'fromRight' : 'fromLeft' });
  },
  pauseAnimations: () => set({ suppressAnimations: true }),
  resumeAnimations: () => set({ suppressAnimations: false }),
}));
