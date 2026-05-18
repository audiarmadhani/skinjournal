/**
 * @deprecated Use analyzeFacePhotos from @/services/face-analysis for vision analysis.
 */
import { generateTemplateInsights, type InsightContext } from './insight-engine';

export type { InsightContext } from './insight-engine';

/** @deprecated Use analyzeFacePhotos with image URLs instead. */
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
  return { insights: generateTemplateInsights(ctx), source: 'template' };
}
