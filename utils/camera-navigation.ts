import { router, type Href } from 'expo-router';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Platform } from 'react-native';
import type { PhotoAngle } from '@/types';
import { useCameraStore } from '@/store/camera-store';
import { pauseTabSlideAnimations } from '@/store/tab-slide-store';
import { confirmAction } from '@/utils/confirm';

function captureHref(baseline?: boolean, retake?: PhotoAngle): Href {
  const params = new URLSearchParams();
  if (baseline) params.set('baseline', 'true');
  if (retake) params.set('retake', retake);
  const q = params.toString();
  return (q ? `/camera/capture?${q}` : '/camera/capture') as Href;
}

/** Open capture modal on the root stack (reliable from nested tab navigator + web). */
export function openCameraCapture(
  options?: { baseline?: boolean; retake?: PhotoAngle },
  navigation?: NavigationProp<ParamListBase>
) {
  const href = captureHref(options?.baseline, options?.retake);
  const params: Record<string, string> = {};
  if (options?.baseline) params.baseline = 'true';
  if (options?.retake) params.retake = options.retake;

  pauseTabSlideAnimations();

  let nav: NavigationProp<ParamListBase> | undefined = navigation;
  while (nav) {
    const routeNames = nav.getState?.().routeNames ?? [];
    if (routeNames.includes('camera/capture')) {
      nav.navigate('camera/capture' as never, params as never);
      return;
    }
    nav = nav.getParent() as NavigationProp<ParamListBase> | undefined;
  }

  if (Platform.OS === 'web') {
    router.navigate(href);
    return;
  }

  router.push(href);
}

/** Leave the camera modal stack and return to Home. */
export function exitCameraFlow() {
  pauseTabSlideAnimations();
  router.dismissAll();
  router.replace('/(tabs)');
  setTimeout(() => useCameraStore.getState().reset(), 0);
}

/** Confirm discard when a multi-angle session is in progress. */
export async function requestExitCameraFlow(): Promise<void> {
  const { captures, isSessionComplete } = useCameraStore.getState();
  const hasAny = Object.keys(captures).length > 0;
  if (hasAny && !isSessionComplete()) {
    const ok = await confirmAction(
      'Discard photos?',
      'You have not finished all three angles. Your progress will be lost.',
      'Discard',
      true
    );
    if (!ok) return;
  }
  pauseTabSlideAnimations();
  if (router.canGoBack()) {
    router.back();
    return;
  }
  exitCameraFlow();
}
