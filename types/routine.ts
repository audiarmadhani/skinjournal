/** Skincare step (e.g. Cleanser) + brand collected during onboarding. */
export interface RoutineProductDraft {
  /** Step / product type */
  name: string;
  brand: string;
  selected: boolean;
}

export function createRoutineDrafts(names: string[], selected = true): RoutineProductDraft[] {
  return names.map((name) => ({ name, brand: '', selected }));
}
