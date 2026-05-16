import { env } from '@/lib/env';
import { generateTemplateInsights, sanitizeInsight, type InsightContext } from './insight-engine';

const SYSTEM_PROMPT = `You are a skincare progress assistant. Generate brief, observational insights only.
NEVER diagnose conditions. NEVER use medical certainty. NEVER claim percentage improvements.
ALWAYS use wording like: appears, visible, may indicate, compared with.
Return 2 short sentences as JSON: {"insights":["...","..."]}`;

export async function generateAIInsights(
  ctx: InsightContext,
  options?: { allowed?: boolean }
): Promise<{
  insights: string[];
  source: 'openai' | 'template';
}> {
  if (options?.allowed === false) {
    throw new Error('Face analysis requires Premium.');
  }
  if (!env.openaiKey) {
    return { insights: generateTemplateInsights(ctx), source: 'template' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(ctx)}. Generate observational skin progress insights.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error('OpenAI request failed');
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content) as { insights: string[] };
    const insights = (parsed.insights ?? []).map(sanitizeInsight);
    if (insights.length >= 1) {
      return { insights, source: 'openai' };
    }
  } catch {
    // fall through to templates
  }

  return { insights: generateTemplateInsights(ctx), source: 'template' };
}
