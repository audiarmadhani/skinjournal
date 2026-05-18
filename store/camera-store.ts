import { create } from 'zustand';
import type { PhotoAngle } from '@/types';
import { PHOTO_ANGLE_ORDER } from '@/constants/photo-angles';

type CapturesMap = Partial<Record<PhotoAngle, string>>;

interface CameraState {
  captures: CapturesMap;
  currentAngle: PhotoAngle;
  isBaseline: boolean;
  lightingQuality: 'good' | 'fair' | 'poor';
  setCaptureForAngle: (angle: PhotoAngle, uri: string) => void;
  setCurrentAngle: (angle: PhotoAngle) => void;
  setIsBaseline: (baseline: boolean) => void;
  setLightingQuality: (quality: 'good' | 'fair' | 'poor') => void;
  isSessionComplete: () => boolean;
  getCaptureUri: (angle: PhotoAngle) => string | undefined;
  reset: () => void;
}

const initialAngle: PhotoAngle = PHOTO_ANGLE_ORDER[0];

export const useCameraStore = create<CameraState>((set, get) => ({
  captures: {},
  currentAngle: initialAngle,
  isBaseline: false,
  lightingQuality: 'fair',
  setCaptureForAngle: (angle, uri) =>
    set((state) => ({
      captures: { ...state.captures, [angle]: uri },
    })),
  setCurrentAngle: (currentAngle) => set({ currentAngle }),
  setIsBaseline: (isBaseline) => set({ isBaseline }),
  setLightingQuality: (lightingQuality) => set({ lightingQuality }),
  isSessionComplete: () => {
    const { captures } = get();
    return PHOTO_ANGLE_ORDER.every((a) => Boolean(captures[a]));
  },
  getCaptureUri: (angle) => get().captures[angle],
  reset: () =>
    set({
      captures: {},
      currentAngle: initialAngle,
      isBaseline: false,
      lightingQuality: 'fair',
    }),
}));
