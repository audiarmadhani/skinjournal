export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  /** Dev only: treat all users as premium */
  forcePremium: process.env.EXPO_PUBLIC_FORCE_PREMIUM === 'true',
} as const;

export function hasSupabaseEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function shouldUseMock(): boolean {
  return env.useMock || !hasSupabaseEnv();
}
