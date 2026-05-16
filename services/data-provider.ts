import { shouldUseMock } from '@/lib/env';
import { mockProvider } from './mock/provider';
import { supabaseProvider } from './supabase/provider';

export const data = shouldUseMock() ? mockProvider : supabaseProvider;

export type { DataProvider } from './mock/provider';
