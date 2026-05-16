import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'skinjournal-theme';

type ThemeState = {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  hydrate: () => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'light',
  hydrated: false,
  setPreference: (preference) => {
    set({ preference });
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ preference }));
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { preference?: string };
        if (parsed.preference === 'dark') {
          set({ preference: 'dark', hydrated: true });
          return;
        }
        // Treat legacy "system" (or unknown) as light.
        set({ preference: 'light', hydrated: true });
        if (parsed.preference === 'system') {
          void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ preference: 'light' }));
        }
        return;
      }
    } catch {
      // Use default preference
    }
    set({ hydrated: true });
  },
}));
