import { useColorScheme } from 'nativewind';
import { paletteForScheme, type ThemePalette } from '@/lib/theme-palettes';

export function useAppColors(): ThemePalette {
  const { colorScheme } = useColorScheme();
  return paletteForScheme(colorScheme === 'dark' ? 'dark' : 'light');
}
