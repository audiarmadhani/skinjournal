import type { RoutineItem } from '@/components/ui/RoutineChecklist';
import type { Product, RoutineLog } from '@/types';
import {
  formatUsageInterval,
  getProductsDueOnDate,
  getProductsNotDueOnDate,
} from '@/utils/product-schedule';

export function buildRoutineItemsForType(
  products: Product[],
  log: RoutineLog | null | undefined,
  dateIso: string,
  routineType: 'morning' | 'night'
): { due: RoutineItem[]; notDue: RoutineItem[] } {
  const filtered = products.filter((p) => p.routine_type === routineType);
  const dueProducts = getProductsDueOnDate(filtered, dateIso);
  const notDueProducts = getProductsNotDueOnDate(filtered, dateIso);
  const completedKey = routineType === 'morning' ? 'morning_completed' : 'night_completed';
  const logMatches = log?.date === dateIso;

  const toItem = (product: Product, disabled: boolean): RoutineItem => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    completed:
      logMatches && log?.[completedKey]?.includes(product.id) ? true : false,
    disabled,
    subtitle: formatUsageInterval(product.usage_interval_days),
  });

  return {
    due: dueProducts.map((p) => toItem(p, false)),
    notDue: notDueProducts.map((p) => toItem(p, true)),
  };
}
