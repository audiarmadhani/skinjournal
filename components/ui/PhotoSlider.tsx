import { useState } from 'react';
import { Image, PanResponder, View, Dimensions } from 'react-native';

interface PhotoSliderProps {
  beforeUri: string;
  afterUri: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;

export function PhotoSlider({ beforeUri, afterUri }: PhotoSliderProps) {
  const [position, setPosition] = useState(SLIDER_WIDTH / 2);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(40, Math.min(SLIDER_WIDTH - 40, gesture.moveX - 24));
      setPosition(next);
    },
  });

  return (
    <View
      className="relative rounded-3xl overflow-hidden"
      style={{ width: SLIDER_WIDTH, height: SLIDER_WIDTH * 1.25 }}
      {...panResponder.panHandlers}
    >
      <Image source={{ uri: afterUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
      <View className="absolute inset-0 overflow-hidden" style={{ width: position }}>
        <Image
          source={{ uri: beforeUri }}
          style={{ width: SLIDER_WIDTH, height: SLIDER_WIDTH * 1.25 }}
          resizeMode="cover"
        />
      </View>
      <View
        className="absolute top-0 bottom-0 w-0.5 bg-white"
        style={{ left: position - 1 }}
      />
      <View
        className="absolute w-10 h-10 rounded-full bg-white items-center justify-center shadow"
        style={{ left: position - 20, top: '50%', marginTop: -20 }}
      >
        <View className="flex-row gap-0.5">
          <View className="w-0.5 h-4 bg-stone-400 rounded" />
          <View className="w-0.5 h-4 bg-stone-400 rounded" />
        </View>
      </View>
    </View>
  );
}
