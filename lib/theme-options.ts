import type { ThemePreference } from '@/store/theme-store';

export const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  description: string;
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Calm, minimal palette optimized for daily use.',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Soft contrast with pink accents for low-light use.',
  },
];
