import { useState, type FormEvent } from 'react';
import { submitWaitlistEmail } from '../lib/waitlist';

const MESSAGES = {
  success: "You're on the list — we'll be in touch.",
  invalid_email: 'Please enter a valid email address.',
  duplicate: "You're already on the list.",
  not_configured: 'Waitlist is not configured yet. Please try again later.',
  network: 'Something went wrong. Please try again.',
} as const;

interface InlineWaitlistFormProps {
  onStatusChange?: (message: string | null, variant: 'success' | 'error' | null) => void;
}

export function InlineWaitlistForm({ onStatusChange }: InlineWaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const setStatus = (message: string | null, variant: 'success' | 'error' | null) => {
    onStatusChange?.(message, variant);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null, null);
    setLoading(true);

    const result = await submitWaitlistEmail(email);
    setLoading(false);

    if (result.ok) {
      setEmail('');
      setStatus(MESSAGES.success, 'success');
      return;
    }

    const message = MESSAGES[result.reason];
    setStatus(message, 'error');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
          disabled={loading}
          className="min-h-[52px] flex-1 rounded-2xl border border-stone-200 bg-surface px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[52px] shrink-0 rounded-2xl bg-pink px-6 py-3 text-base font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-8"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                aria-hidden
              />
              Joining…
            </span>
          ) : (
            'Join waitlist'
          )}
        </button>
      </div>
    </form>
  );
}
