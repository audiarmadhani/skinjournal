import type { ProfileSex } from '@/types';

export const PROFILE_MIN_AGE = 13;
export const PROFILE_MAX_AGE = 120;

export const PROFILE_SEX_OPTIONS: { id: ProfileSex; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

/** Returns null if empty or out of range. */
export function parseProfileAge(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n)) return null;
  if (n < PROFILE_MIN_AGE || n > PROFILE_MAX_AGE) return null;
  return n;
}
