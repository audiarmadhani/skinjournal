import type { Product } from '@/types';
import { MAX_USAGE_INTERVAL, MIN_USAGE_INTERVAL } from '@/types/database';
import { parseLocalDate } from '@/utils/dates';

export { MIN_USAGE_INTERVAL, MAX_USAGE_INTERVAL };

export function normalizeUsageInterval(value: unknown): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseInt(value.trim(), 10)
        : NaN;
  if (!Number.isFinite(n)) return MIN_USAGE_INTERVAL;
  return Math.min(MAX_USAGE_INTERVAL, Math.max(MIN_USAGE_INTERVAL, Math.round(n)));
}

export function withNormalizedInterval(product: Product): Product {
  return {
    ...product,
    usage_interval_days: normalizeUsageInterval(product.usage_interval_days),
  };
}

export function daysBetween(startIso: string, dateIso: string): number {
  const ms = parseLocalDate(dateIso).getTime() - parseLocalDate(startIso).getTime();
  return Math.floor(ms / 86_400_000);
}

export function isProductDueOnDate(product: Product, dateIso: string): boolean {
  const interval = normalizeUsageInterval(product.usage_interval_days);
  if (dateIso < product.started_at) return false;
  if (interval <= 1) return true;
  return daysBetween(product.started_at, dateIso) % interval === 0;
}

export function getProductsDueOnDate(products: Product[], dateIso: string): Product[] {
  return products.filter((p) => isProductDueOnDate(p, dateIso));
}

export function getProductsNotDueOnDate(products: Product[], dateIso: string): Product[] {
  return products.filter((p) => !isProductDueOnDate(p, dateIso));
}

export function formatUsageInterval(days: number): string {
  const n = normalizeUsageInterval(days);
  if (n === 1) return 'Daily';
  return `Every ${n} days`;
}

export function parseIntervalInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < MIN_USAGE_INTERVAL || n > MAX_USAGE_INTERVAL) return null;
  return n;
}

/** Default cadence when onboarding only collects step name (not interval). */
export function defaultUsageIntervalForStepName(stepName: string): number {
  const key = stepName.trim().toLowerCase();
  if (
    key.includes('retinol') ||
    key.includes('tretinoin') ||
    key.includes('adapalene') ||
    key.includes('tazarotene')
  ) {
    return 3;
  }
  return 1;
}
