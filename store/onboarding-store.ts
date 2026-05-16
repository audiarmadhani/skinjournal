import { create } from 'zustand';
import type { ProfileSex, SkinGoal } from '@/types';
import { createRoutineDrafts, type RoutineProductDraft } from '@/types/routine';

export const SKIN_GOALS: { id: SkinGoal; label: string }[] = [
  { id: 'acne', label: 'Acne' },
  { id: 'dark_spots', label: 'Dark spots' },
  { id: 'hydration', label: 'Hydration' },
  { id: 'redness', label: 'Redness' },
  { id: 'texture', label: 'Texture' },
  { id: 'brightness', label: 'Brightness' },
  { id: 'oil_control', label: 'Oil control' },
  { id: 'pores', label: 'Pores' },
];

export const CONCERNS = [
  'Dryness',
  'Oiliness',
  'Sensitivity',
  'Breakouts',
  'Uneven tone',
  'Fine lines',
  'Dullness',
  'Dark circles',
];

export const MORNING_DEFAULTS = [
  'Cleanser',
  'Toner',
  'Vitamin C',
  'Serum',
  'Moisturizer',
  'Sunscreen',
];

export const NIGHT_DEFAULTS = ['Cleanser', 'Retinol', 'Serum', 'Moisturizer'];

function toggleDraft(products: RoutineProductDraft[], name: string): RoutineProductDraft[] {
  return products.map((p) => (p.name === name ? { ...p, selected: !p.selected } : p));
}

function setDraftBrand(
  products: RoutineProductDraft[],
  name: string,
  brand: string
): RoutineProductDraft[] {
  return products.map((p) => (p.name === name ? { ...p, brand } : p));
}

function addCustomDraft(products: RoutineProductDraft[], name: string): RoutineProductDraft[] {
  const trimmed = name.trim();
  if (!trimmed || products.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return products;
  }
  return [...products, { name: trimmed, brand: '', selected: true }];
}

interface OnboardingState {
  step: number;
  skinGoals: SkinGoal[];
  concerns: string[];
  ageYears: number | null;
  sex: ProfileSex | null;
  morningRoutine: RoutineProductDraft[];
  nightRoutine: RoutineProductDraft[];
  permissionsGranted: boolean;
  pendingServerSync: boolean;
  localOnboardingComplete: boolean;
  activeUserId: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleGoal: (goal: SkinGoal) => void;
  toggleConcern: (concern: string) => void;
  setAgeYears: (value: number | null) => void;
  setSex: (value: ProfileSex | null) => void;
  toggleMorning: (name: string) => void;
  toggleNight: (name: string) => void;
  setMorningBrand: (name: string, brand: string) => void;
  setNightBrand: (name: string, brand: string) => void;
  addMorningCustom: (name: string) => void;
  addNightCustom: (name: string) => void;
  setPermissionsGranted: (granted: boolean) => void;
  setPendingServerSync: (pending: boolean) => void;
  setLocalOnboardingComplete: (complete: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 0,
  skinGoals: [],
  concerns: [],
  ageYears: null,
  sex: null,
  morningRoutine: createRoutineDrafts(MORNING_DEFAULTS),
  nightRoutine: createRoutineDrafts(NIGHT_DEFAULTS),
  permissionsGranted: false,
  pendingServerSync: false,
  localOnboardingComplete: false,
  activeUserId: null,
  setStep: (step) => set({ step }),
  nextStep: () => set({ step: Math.min(get().step + 1, 7) }),
  prevStep: () => set({ step: Math.max(get().step - 1, 0) }),
  toggleGoal: (goal) => {
    const { skinGoals } = get();
    set({
      skinGoals: skinGoals.includes(goal)
        ? skinGoals.filter((g) => g !== goal)
        : [...skinGoals, goal],
    });
  },
  toggleConcern: (concern) => {
    const { concerns } = get();
    set({
      concerns: concerns.includes(concern)
        ? concerns.filter((c) => c !== concern)
        : [...concerns, concern],
    });
  },
  toggleMorning: (name) => set({ morningRoutine: toggleDraft(get().morningRoutine, name) }),
  toggleNight: (name) => set({ nightRoutine: toggleDraft(get().nightRoutine, name) }),
  setMorningBrand: (name, brand) =>
    set({ morningRoutine: setDraftBrand(get().morningRoutine, name, brand) }),
  setNightBrand: (name, brand) =>
    set({ nightRoutine: setDraftBrand(get().nightRoutine, name, brand) }),
  setAgeYears: (ageYears) => set({ ageYears }),
  setSex: (sex) => set({ sex }),
  addMorningCustom: (name) =>
    set({ morningRoutine: addCustomDraft(get().morningRoutine, name) }),
  addNightCustom: (name) =>
    set({ nightRoutine: addCustomDraft(get().nightRoutine, name) }),
  setPermissionsGranted: (permissionsGranted) => set({ permissionsGranted }),
  setPendingServerSync: (pendingServerSync) => set({ pendingServerSync }),
  setLocalOnboardingComplete: (localOnboardingComplete) => set({ localOnboardingComplete }),
  reset: () =>
    set({
      step: 0,
      skinGoals: [],
      concerns: [],
      ageYears: null,
      sex: null,
      morningRoutine: createRoutineDrafts(MORNING_DEFAULTS),
      nightRoutine: createRoutineDrafts(NIGHT_DEFAULTS),
      permissionsGranted: false,
      pendingServerSync: false,
      localOnboardingComplete: false,
      activeUserId: null,
    }),
}));
