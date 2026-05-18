<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the SkinJournal Expo app. Here is a summary of all changes made:

- **`lib/posthog.ts`** (new) — PostHog client singleton initialised from `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` environment variables, with lifecycle event capture enabled.
- **`lib/analytics.ts`** (updated) — The existing stub `track()` function is now wired to `posthog.capture()`, so all existing call sites automatically send real events.
- **`app/_layout.tsx`** (updated) — Wrapped the app in `PostHogProvider` (with touch autocapture) and added a `ScreenTracker` component for manual screen tracking via `posthog.screen()`. The `AuthSessionListener` now calls `posthog.identify()` on sign-in and `posthog.reset()` on sign-out.
- **`app/(auth)/signup.tsx`** (updated) — `posthog.identify()` and `user_signed_up` capture added on successful email signup.
- **`app/(auth)/login.tsx`** (updated) — `posthog.identify()` and `user_signed_in` capture added on successful email login.
- **`app/(onboarding)/baseline.tsx`** (updated) — `baseline_started`, `baseline_skipped`, and `onboarding_completed` events added.
- **`app/camera/result.tsx`** (updated) — `photo_analysis_run` fires when AI face analysis completes; `paywall_shown` fires when a non-premium user sees the upgrade prompt; `onboarding_completed` fires when a baseline photo session finishes.
- **`app/subscribe.tsx`** (updated) — `premium_screen_viewed` fires on mount; `premium_upgrade_tapped` fires when the subscribe button is pressed.
- **`app/routine/manage.tsx`** (updated) — `routine_product_added` and `routine_product_deleted` events added.
- **`app/(tabs)/index.tsx`** (updated) — `routine_step_toggled` fires with `routine_type` and `checked` properties when the user checks or unchecks a morning/night routine step.
- **`.env`** (updated) — `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` values set.
- **`.env.example`** (updated) — `EXPO_PUBLIC_POSTHOG_HOST` placeholder added.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | New user created an account (email) | `app/(auth)/signup.tsx` |
| `user_signed_in` | Existing user signed in (email) | `app/(auth)/login.tsx` |
| `onboarding_completed` | User finished onboarding (baseline photo or skip) | `app/(onboarding)/baseline.tsx`, `app/camera/result.tsx` |
| `baseline_started` | User tapped "Start baseline capture" | `app/(onboarding)/baseline.tsx` |
| `baseline_skipped` | User tapped "Skip for now" on baseline screen | `app/(onboarding)/baseline.tsx` |
| `photo_captured` | Journal photo session saved (pre-existing stub, now wired) | `app/camera/result.tsx` |
| `photo_analysis_run` | AI face analysis completed successfully | `app/camera/result.tsx` |
| `paywall_shown` | Paywall shown to a non-premium user after photo save | `app/camera/result.tsx` |
| `premium_screen_viewed` | Subscribe/premium screen opened | `app/subscribe.tsx` |
| `premium_upgrade_tapped` | User tapped the Subscribe button | `app/subscribe.tsx` |
| `routine_product_added` | User added a product to their routine | `app/routine/manage.tsx` |
| `routine_product_deleted` | User deleted a product from their routine | `app/routine/manage.tsx` |
| `routine_step_toggled` | User checked/unchecked a morning or night routine step | `app/(tabs)/index.tsx` |
| `insight_viewed` | Insights tab opened (pre-existing stub, now wired) | `app/(tabs)/insights.tsx` |
| `share_exported` | Journey card shared or saved (pre-existing stub, now wired) | `app/share/generate.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1592509)
- [New signups over time](/insights/58Irj0gj) — daily signup trend
- [Onboarding completion funnel](/insights/mqi2YJFy) — signup → onboarding completed conversion
- [Premium upgrade funnel](/insights/cy3V49FO) — paywall shown → premium screen → upgrade tapped
- [Daily photo captures](/insights/TBOhmOj2) — journal entries saved per day
- [Routine engagement](/insights/dmZ0k9ip) — routine steps toggled and products added

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
