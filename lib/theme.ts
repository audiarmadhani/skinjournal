import { lightColors } from '@/lib/theme-colors';

/** Static light tokens for modules that cannot use hooks. Prefer `useAppColors()` in components. */
export const colors = {
  background: lightColors.background,
  surface: lightColors.surface,
  ink: lightColors.ink,
  muted: lightColors.muted,
  pink: lightColors.pink,
  pinkLight: lightColors.pinkLight,
  pinkDark: lightColors.pinkDark,
  pinkGradientStart: lightColors.pinkGradientStart,
  pinkGradientEnd: lightColors.pinkGradientEnd,
  peach: lightColors.peach,
  peachLight: lightColors.peachLight,
  lavender: lightColors.lavender,
  lavenderLight: lightColors.lavenderLight,
  mint: lightColors.mint,
  mintLight: lightColors.mintLight,
  cocoa: lightColors.cocoa,
  border: lightColors.border,
} as const;

export const radii = {
  card: 28,
  button: 20,
  pill: 9999,
} as const;
