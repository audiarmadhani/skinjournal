# Edge Functions

## analyze-face

Vision-based journal insights (OpenAI `gpt-4o-mini`). Called from the app via `supabase.functions.invoke('analyze-face', …)`.

### Setup

1. Link your project: `supabase link --project-ref <ref>`
2. Set secret: `supabase secrets set OPENAI_API_KEY=sk-your-key`
3. Deploy: `supabase functions deploy analyze-face`

### Requirements

- User must be authenticated (JWT).
- User profile `subscription_tier` must be `premium` (server-enforced).
- `frontImageUrl` must be a public URL from your project's `photos` storage bucket.

### Local invoke

```bash
supabase functions serve analyze-face --env-file supabase/.env.local
```
