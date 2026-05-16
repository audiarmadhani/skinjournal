/** Single source of truth for light/dark theme colors (hex + RGB channels for CSS vars). */

export type ThemeColorSet = {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  border: string;
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
  stone100: string;
  stone200: string;
  stone300: string;
  stone400: string;
  stone500: string;
  stone800: string;
  stone900: string;
};

export const lightColors: ThemeColorSet = {
  background: '#FAF7F8',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#8A8580',
  border: '#E5E2DD',
  pink: '#F2A8BC',
  pinkLight: '#FDE8F0',
  pinkDark: '#E88AA6',
  pinkGradientStart: '#FDE8F0',
  pinkGradientEnd: '#F5CED9',
  peach: '#F5D5C8',
  peachLight: '#FAE8E0',
  lavender: '#E4DCF5',
  lavenderLight: '#F0EBFA',
  mint: '#D4E8D4',
  mintLight: '#E8F4E8',
  cocoa: '#8B6F5C',
  stone100: '#F0EEEB',
  stone200: '#E5E2DD',
  stone300: '#C9C4BC',
  stone400: '#A39E96',
  stone500: '#8A8580',
  stone800: '#2C2C2C',
  stone900: '#1A1A1A',
};

/** Warm plum-tinted dark theme — soft pink accents, not flat gray/black. */
export const darkColors: ThemeColorSet = {
  background: '#1C171A',
  surface: '#282226',
  ink: '#FAF7F8',
  muted: '#A89BA3',
  border: '#40363C',
  pink: '#F2A8BC',
  pinkLight: '#4D3844',
  pinkDark: '#E88AA6',
  pinkGradientStart: '#302429',
  pinkGradientEnd: '#453038',
  peach: '#5C4A44',
  peachLight: '#3A302E',
  lavender: '#4A4458',
  lavenderLight: '#322E3C',
  mint: '#3A4A42',
  mintLight: '#2A3430',
  cocoa: '#C9B0A0',
  stone100: '#332C30',
  stone200: '#40363C',
  stone300: '#5C5258',
  stone400: '#8A7E86',
  stone500: '#A89BA3',
  stone800: '#E8E2E6',
  stone900: '#FAF7F8',
};

export function hexToRgbChannels(hex: string): string {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
}

export function colorSetToCssVars(colors: ThemeColorSet): Record<string, string> {
  return {
    '--color-background': hexToRgbChannels(colors.background),
    '--color-surface': hexToRgbChannels(colors.surface),
    '--color-ink': hexToRgbChannels(colors.ink),
    '--color-muted': hexToRgbChannels(colors.muted),
    '--color-border': hexToRgbChannels(colors.border),
    '--color-pink': hexToRgbChannels(colors.pink),
    '--color-pink-light': hexToRgbChannels(colors.pinkLight),
    '--color-pink-dark': hexToRgbChannels(colors.pinkDark),
    '--color-peach': hexToRgbChannels(colors.peach),
    '--color-peach-light': hexToRgbChannels(colors.peachLight),
    '--color-lavender': hexToRgbChannels(colors.lavender),
    '--color-lavender-light': hexToRgbChannels(colors.lavenderLight),
    '--color-mint': hexToRgbChannels(colors.mint),
    '--color-mint-light': hexToRgbChannels(colors.mintLight),
    '--color-cocoa': hexToRgbChannels(colors.cocoa),
    '--color-stone-100': hexToRgbChannels(colors.stone100),
    '--color-stone-200': hexToRgbChannels(colors.stone200),
    '--color-stone-300': hexToRgbChannels(colors.stone300),
    '--color-stone-400': hexToRgbChannels(colors.stone400),
    '--color-stone-500': hexToRgbChannels(colors.stone500),
    '--color-stone-800': hexToRgbChannels(colors.stone800),
    '--color-stone-900': hexToRgbChannels(colors.stone900),
  };
}
