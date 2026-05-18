const BLOCKED = [
  /\byou have\b/i,
  /\bsevere\b/i,
  /\bdiagnos/i,
  /\breduced .+ by \d+%/i,
  /\bimproved by \d+%/i,
];

const REQUIRED_HINTS = ['appears', 'visible', 'may indicate', 'compared with', 'consistent'];

const GENERAL_TEMPLATE =
  'Visible skin texture appears smoother compared with your baseline.';

export function sanitizeInsight(text: string): string {
  let result = text.trim();
  for (const pattern of BLOCKED) {
    if (pattern.test(result)) {
      return GENERAL_TEMPLATE;
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

export function sanitizeInsights(insights: string[]): string[] {
  return insights.map(sanitizeInsight).filter((s) => s.length > 0);
}
