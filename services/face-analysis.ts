import { getSupabase } from '@/lib/supabase';
import { shouldUseMock } from '@/lib/env';
import {
  generateTemplateInsights,
  type InsightContext,
} from '@/services/insight-engine';

export interface AnalyzeFacePhotosInput {
  frontImageUrl: string;
  baselineImageUrl?: string | null;
  context: InsightContext;
}

export interface FaceAnalysisResult {
  insights: string[];
  source: 'openai' | 'template';
  model?: string;
  analyzed_at?: string;
}

export async function analyzeFacePhotos(
  input: AnalyzeFacePhotosInput,
  options?: { allowed?: boolean }
): Promise<FaceAnalysisResult> {
  if (options?.allowed === false) {
    throw new Error('Face analysis requires Premium.');
  }

  if (shouldUseMock()) {
    return {
      insights: generateTemplateInsights(input.context),
      source: 'template',
      analyzed_at: new Date().toISOString(),
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      insights: generateTemplateInsights(input.context),
      source: 'template',
      analyzed_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase.functions.invoke('analyze-face', {
    body: {
      frontImageUrl: input.frontImageUrl,
      baselineImageUrl: input.baselineImageUrl ?? null,
      context: input.context,
    },
  });

  if (error) {
    console.warn('analyze-face invoke error', error.message);
    return {
      insights: generateTemplateInsights(input.context),
      source: 'template',
      analyzed_at: new Date().toISOString(),
    };
  }

  const payload = data as {
    insights?: string[];
    source?: 'openai' | 'template';
    model?: string;
    analyzed_at?: string;
    fallback?: boolean;
    error?: string;
  };

  if (payload?.insights?.length) {
    return {
      insights: payload.insights,
      source: payload.source === 'openai' ? 'openai' : 'template',
      model: payload.model,
      analyzed_at: payload.analyzed_at ?? new Date().toISOString(),
    };
  }

  return {
    insights: generateTemplateInsights(input.context),
    source: 'template',
    analyzed_at: new Date().toISOString(),
  };
}
