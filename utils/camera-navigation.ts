import { router, type Href } from 'expo-router';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useCameraStore } from '@/store/camera-store';

function captureHref(baseline?: boolean): Href {
  return (baseline ? '/camera/capture?baseline=true' : '/camera/capture') as Href;
}

/** Open capture modal on the root stack (reliable from nested tab navigator + web). */
export function openCameraCapture(
  options?: { baseline?: boolean },
  navigation?: NavigationProp<ParamListBase>
) {
  const href = captureHref(options?.baseline);
  const params = options?.baseline ? { baseline: 'true' } : undefined;

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
  router.dismissAll();
  router.replace('/(tabs)');
  setTimeout(() => useCameraStore.getState().reset(), 0);
}
