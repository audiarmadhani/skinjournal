import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sanitizeInsights } from '../_shared/insight-sanitize.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a skincare progress assistant. Compare the user's current front-facing progress photo with their baseline when provided.
Generate brief, observational insights only.
NEVER diagnose conditions. NEVER use medical certainty. NEVER claim percentage improvements.
ALWAYS use wording like: appears, visible, may indicate, compared with.
Focus on visible texture, tone evenness, redness, and hydration cues — wellness observations only.
Return exactly 2 short sentences as JSON: {"insights":["...","..."]}`;

interface InsightContext {
  daysSinceBaseline?: number;
  streak?: number;
  routinePercent?: number;
  lightingQuality?: string;
  compareWithLastWeek?: boolean;
}

interface AnalyzeBody {
  frontImageUrl: string;
  baselineImageUrl?: string | null;
  context?: InsightContext;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isPremiumProfile(row: {
  subscription_tier?: string;
  premium_expires_at?: string | null;
}): boolean {
  if (row.subscription_tier !== 'premium') return false;
  if (!row.premium_expires_at) return true;
  return new Date(row.premium_expires_at).getTime() > Date.now();
}

/** Only allow URLs from this project's Supabase storage public bucket. */
function isAllowedImageUrl(url: string, supabaseUrl: string): boolean {
  try {
    const parsed = new URL(url);
    const base = new URL(supabaseUrl);
    if (parsed.origin !== base.origin) return false;
    return parsed.pathname.includes('/storage/v1/object/public/photos/');
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier, premium_expires_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ error: 'Could not load profile' }, 500);
  }

  if (!profile || !isPremiumProfile(profile)) {
    return jsonResponse({ error: 'Face analysis requires Premium.' }, 403);
  }

  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { frontImageUrl, baselineImageUrl, context } = body;
  if (!frontImageUrl || typeof frontImageUrl !== 'string') {
    return jsonResponse({ error: 'frontImageUrl is required' }, 400);
  }

  if (!isAllowedImageUrl(frontImageUrl, supabaseUrl)) {
    return jsonResponse({ error: 'Invalid frontImageUrl' }, 400);
  }

  if (baselineImageUrl) {
    if (!isAllowedImageUrl(baselineImageUrl, supabaseUrl)) {
      return jsonResponse({ error: 'Invalid baselineImageUrl' }, 400);
    }
  }

  if (!openaiKey) {
    return jsonResponse({ error: 'OpenAI not configured', fallback: true }, 503);
  }

  const userText = `Journal context: ${JSON.stringify(context ?? {})}.
The first image is today's front-facing progress photo.
${baselineImageUrl ? 'The second image is the user baseline (Day 1) front photo for comparison.' : 'No baseline image — describe visible observations only.'}
Generate observational skin progress insights.`;

  const userContent: Array<
    { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'low' } }
  > = [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: frontImageUrl, detail: 'low' } }];

  if (baselineImageUrl) {
    userContent.push({
      type: 'image_url',
      image_url: { url: baselineImageUrl, detail: 'low' },
    });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 300,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error', openaiRes.status, errText);
      return jsonResponse({ error: 'Analysis failed', fallback: true }, 502);
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content) as { insights?: string[] };
    const raw = Array.isArray(parsed.insights) ? parsed.insights : [];
    const insights = sanitizeInsights(raw).slice(0, 2);

    if (insights.length < 1) {
      return jsonResponse({ error: 'Empty analysis', fallback: true }, 502);
    }

    return jsonResponse({
      insights,
      source: 'openai',
      model: 'gpt-4o-mini',
      analyzed_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('analyze-face error', e);
    return jsonResponse({ error: 'Analysis failed', fallback: true }, 502);
  }
});
