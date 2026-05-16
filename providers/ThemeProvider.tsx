import { useEffect } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/store/theme-store';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useThemeStore((s) => s.preference);
  const hydrated = useThemeStore((s) => s.hydrated);
  const hydrate = useThemeStore((s) => s.hydrate);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      setColorScheme(preference);
    } catch {
      // NativeWind may not be ready on first paint.
    }
  }, [preference, hydrated, setColorScheme]);

  return <View className="flex-1 bg-background">{children}</View>;
}
