# SkinJournal

A premium skincare progress-tracking app built with Expo, React Native, and TypeScript.

## Features

- Daily progress photos with camera guidance overlay
- Routine tracking (morning/night) with swipe-to-complete
- Streak tracking focused on consistency
- AI-generated insights (OpenAI when configured, safe templates otherwise)
- Visual timeline with before/after comparison
- Shareable transformation cards
- Local notification reminders

## Tech stack

- Expo SDK 54 + Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
- Zustand + TanStack Query
- Supabase (Auth, Database, Storage) — hybrid mock fallback
- Expo Camera, Notifications, Image Picker

## Quick start

```bash
npm install
cp .env.example .env
npm start
```

Press `i` for iOS simulator or scan the QR code with Expo Go.

### Demo mode (default)

With `EXPO_PUBLIC_USE_MOCK=true` or no Supabase keys, the app runs with seeded demo data (user "Audi", 12-day streak, sample photos).

### Supabase setup

1. Create a Supabase project
2. Run `supabase/migrations/001_initial.sql` in the SQL editor
3. Enable Email auth (and Google/Apple if desired)
4. Create a public `photos` storage bucket
5. **Authentication → URL Configuration → Redirect URLs** — add:
   - `skinjournal://auth/callback`
   - `exp://**` (for Expo Go)
   - After `npm start`, if Google sign-in fails, copy the redirect URL from the error alert and add it to Supabase
5. Set env vars in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_USE_MOCK=false
```

### OpenAI insights (optional)

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

Without a key, insights use curated template copy with medical-language guardrails.

## Waitlist landing page

A separate marketing site lives in [`waitlist/`](waitlist/) (Vite + React + Tailwind). It collects emails into the `waitlist_signups` Supabase table (migration `008_waitlist.sql`).

```bash
cd waitlist
npm install
cp .env.example .env   # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

Deploy to Vercel with **Root Directory** set to `waitlist`, build command `npm run build`, output `dist`.

**Required Vercel env vars** (Settings → Environment Variables, then redeploy):

- `VITE_SUPABASE_URL` — same value as `EXPO_PUBLIC_SUPABASE_URL` in the app
- `VITE_SUPABASE_ANON_KEY` — same value as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Without these, the waitlist form shows “not configured yet” because Vite bakes env vars in at build time.

## Project structure

```
waitlist/      # Marketing waitlist site (Vite)
app/           # Expo Router screens
components/ui/ # Reusable UI primitives
features/      # Domain modules (auth, camera, onboarding)
services/      # Data providers, AI, notifications
store/         # Zustand state
hooks/         # React Query hooks
types/         # TypeScript types
lib/           # Supabase, theme, analytics
supabase/      # SQL migrations
```

## Manual test checklist

- [ ] Splash → routes to tabs in demo mode
- [ ] Home shows streak, routine, insight, photo CTA
- [ ] Camera capture → preview → analyze → result
- [ ] Timeline grid and compare mode
- [ ] Insights charts and observations
- [ ] Routine edit with swipe complete
- [ ] Share card export
- [ ] Profile settings navigation
- [ ] Onboarding flow (7 steps) from signup

## AI insight policy

Insights use observational language only: "appears", "visible", "compared with". No diagnoses or percentage medical claims.
