import type { RoutineProductDraft } from '@/types/routine';

export function getSelectedRoutineProducts(products: RoutineProductDraft[]): RoutineProductDraft[] {
  return products.filter((p) => p.selected);
}

export function validateRoutineBrands(products: RoutineProductDraft[]): string | null {
  const selected = getSelectedRoutineProducts(products);
  if (selected.length === 0) {
    return 'Select at least one product step for your routine.';
  }
  const missing = selected.filter((p) => !p.brand.trim());
  if (missing.length > 0) {
    return `Enter a brand for: ${missing.map((p) => p.name).join(', ')}`;
  }
  return null;
}
