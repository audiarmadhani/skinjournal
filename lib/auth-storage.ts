import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

/** In-memory storage for SSR / Node (expo-router web prerender). */
const memory = new Map<string, string>();

const memoryStorage: SupportedStorage = {
  getItem: async (key) => memory.get(key) ?? null,
  setItem: async (key, value) => {
    memory.set(key, value);
  },
  removeItem: async (key) => {
    memory.delete(key);
  },
};

const webStorage: SupportedStorage = {
  getItem: async (key) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/**
 * Supabase auth storage that works on native, web, and SSR.
 * AsyncStorage touches `window` during Node SSR — that crashes Metro web bundling.
 */
export function getAuthStorage(): SupportedStorage {
  if (typeof window === 'undefined') {
    return memoryStorage;
  }
  if (Platform.OS === 'web') {
    return webStorage;
  }
  return AsyncStorage;
}
