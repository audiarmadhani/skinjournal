import { darkColors, lightColors, type ThemeColorSet } from '@/lib/theme-colors';

export type ThemePalette = {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  pink: string;
  pinkLight: string;
  pinkDark: string;
  pinkGradientStart: string;
  pinkGradientEnd: string;
  peach: string;
  peachLight: string;
  lavender: string;
  lavenderLight: string;
  mint: string;
  mintLight: string;
  cocoa: string;
  border: string;
};

function toPalette(colors: ThemeColorSet): ThemePalette {
  return {
    background: colors.background,
    surface: colors.surface,
    ink: colors.ink,
    muted: colors.muted,
    pink: colors.pink,
    pinkLight: colors.pinkLight,
    pinkDark: colors.pinkDark,
    pinkGradientStart: colors.pinkGradientStart,
    pinkGradientEnd: colors.pinkGradientEnd,
    peach: colors.peach,
    peachLight: colors.peachLight,
    lavender: colors.lavender,
    lavenderLight: colors.lavenderLight,
    mint: colors.mint,
    mintLight: colors.mintLight,
    cocoa: colors.cocoa,
    border: colors.border,
  };
}

export const lightPalette = toPalette(lightColors);
export const darkPalette = toPalette(darkColors);

export function paletteForScheme(scheme: 'light' | 'dark'): ThemePalette {
  return scheme === 'dark' ? darkPalette : lightPalette;
}
