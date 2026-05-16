export * from './database';
export * from './routine';

export interface WeeklySummary {
  photosThisWeek: number;
  routineConsistency: number;
}

export interface JourneySummary {
  headline: string;
  observations: string[];
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  description: string;
  type: 'week' | 'month' | 'routine_change' | 'product_change';
}
