import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useTabSlideStore } from '@/store/tab-slide-store';

/** Quick slide with minimal bounce. */
const TAB_SLIDE_SPRING = {
  damping: 28,
  stiffness: 380,
  mass: 0.7,
};

/** Skip motion only for the first tab focus after app launch. */
let hasSkippedLaunchFocus = false;

interface TabSlideScreenProps {
  children: ReactNode;
}

export function TabSlideScreen({ children }: TabSlideScreenProps) {
  const direction = useTabSlideStore((s) => s.direction);
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const [stackOrder, setStackOrder] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const resumeIfOverlayClosed = () => {
        if (useTabSlideStore.getState().suppressAnimations) {
          useTabSlideStore.getState().resumeAnimations();
        }
      };

      if (reduceMotion) {
        translateX.value = 0;
        setStackOrder(1);
        return;
      }

      if (!hasSkippedLaunchFocus) {
        hasSkippedLaunchFocus = true;
        translateX.value = 0;
        setStackOrder(1);
        return;
      }

      if (useTabSlideStore.getState().suppressAnimations) {
        cancelAnimation(translateX);
        translateX.value = 0;
        setStackOrder(1);
        runOnJS(resumeIfOverlayClosed)();
        return;
      }

      setStackOrder(2);
      cancelAnimation(translateX);
      const enterFrom = direction === 'fromRight' ? width : -width;
      translateX.value = enterFrom;
      translateX.value = withSpring(0, TAB_SLIDE_SPRING);

      return () => {
        if (useTabSlideStore.getState().suppressAnimations) {
          cancelAnimation(translateX);
          translateX.value = 0;
          setStackOrder(1);
          return;
        }

        setStackOrder(3);
        cancelAnimation(translateX);
        const exitTo = direction === 'fromRight' ? -width : width;
        translateX.value = withSpring(exitTo, TAB_SLIDE_SPRING, (finished) => {
          if (finished) {
            runOnJS(setStackOrder)(0);
          }
        });
      };
    }, [direction, width, reduceMotion])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (reduceMotion) {
    return <View className="flex-1">{children}</View>;
  }

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle, { zIndex: stackOrder }]}
      pointerEvents={stackOrder === 1 || stackOrder === 2 ? 'auto' : 'none'}
      className="flex-1 bg-background"
    >
      {children}
    </Animated.View>
  );
}
