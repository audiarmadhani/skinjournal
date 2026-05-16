const BLOCKED = [
  /\byou have\b/i,
  /\bsevere\b/i,
  /\bdiagnos/i,
  /\breduced .+ by \d+%/i,
  /\bimproved by \d+%/i,
];

const REQUIRED_HINTS = ['appears', 'visible', 'may indicate', 'compared with', 'consistent'];

export function sanitizeInsight(text: string): string {
  let result = text.trim();
  for (const pattern of BLOCKED) {
    if (pattern.test(result)) {
      return getTemplateInsight('general');
    }
  }
  const hasSafe = REQUIRED_HINTS.some((h) => result.toLowerCase().includes(h));
  if (!hasSafe) {
    result = `Visible changes ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
    if (!result.includes('appear')) {
      result = result.replace(/^Visible/, 'Skin appearance appears');
    }
  }
  return result;
}

const TEMPLATES: Record<string, string[]> = {
  general: [
    'Visible skin texture appears smoother compared with your baseline.',
    'Skin appearance appears more consistent compared with earlier photos.',
    'Visible redness appears reduced compared with your baseline.',
  ],
  streak: [
    'Your consistency this week may indicate steady progress in your routine.',
    'Regular photo capture appears to support tracking visible changes over time.',
  ],
  routine: [
    'Routine consistency appears strong this week compared with last week.',
    'Visible skin appearance may indicate benefits from your current routine.',
  ],
};

export function getTemplateInsight(
  category: keyof typeof TEMPLATES,
  context?: { streak?: number; routinePercent?: number; daysSinceBaseline?: number }
): string {
  const pool = TEMPLATES[category] ?? TEMPLATES.general;
  if (context?.streak && context.streak >= 7) {
    return sanitizeInsight(pool[1] ?? pool[0]);
  }
  if (context?.routinePercent && context.routinePercent >= 80) {
    return sanitizeInsight(TEMPLATES.routine[0]);
  }
  const idx = Math.floor(Math.random() * pool.length);
  return sanitizeInsight(pool[idx]);
}

export interface InsightContext {
  daysSinceBaseline?: number;
  streak?: number;
  routinePercent?: number;
  lightingQuality?: string;
  compareWithLastWeek?: boolean;
}

export function generateTemplateInsights(ctx: InsightContext): string[] {
  const primary = getTemplateInsight('general', ctx);
  const secondary =
    ctx.compareWithLastWeek !== false
      ? 'Compared with last week, skin appearance appears more consistent.'
      : getTemplateInsight('routine', ctx);
  return [sanitizeInsight(primary), sanitizeInsight(secondary)];
}
