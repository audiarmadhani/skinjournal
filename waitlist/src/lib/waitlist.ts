import { getSupabase, isSupabaseConfigured } from './supabase';

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_email' | 'duplicate' | 'not_configured' | 'network' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export async function submitWaitlistEmail(email: string): Promise<WaitlistResult> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, reason: 'invalid_email' };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'not_configured' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, reason: 'not_configured' };
  }

  const referrer =
    typeof document !== 'undefined' && document.referrer
      ? document.referrer.slice(0, 500)
      : null;

  const { error } = await supabase.from('waitlist_signups').insert({
    email: normalized,
    referrer,
  });

  if (error) {
    if (error.code === '23505') {
      return { ok: false, reason: 'duplicate' };
    }
    return { ok: false, reason: 'network' };
  }

  return { ok: true };
}
