import { create } from 'zustand';

interface CameraState {
  captureUri: string | null;
  isBaseline: boolean;
  lightingQuality: 'good' | 'fair' | 'poor';
  setCaptureUri: (uri: string | null) => void;
  setIsBaseline: (baseline: boolean) => void;
  setLightingQuality: (quality: 'good' | 'fair' | 'poor') => void;
  reset: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  captureUri: null,
  isBaseline: false,
  lightingQuality: 'fair',
  setCaptureUri: (captureUri) => set({ captureUri }),
  setIsBaseline: (isBaseline) => set({ isBaseline }),
  setLightingQuality: (lightingQuality) => set({ lightingQuality }),
  reset: () => set({ captureUri: null, isBaseline: false, lightingQuality: 'fair' }),
}));
