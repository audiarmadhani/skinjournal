import { forwardRef } from 'react';
import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShareCardTemplateProps {
  beforeUri: string;
  afterUri: string;
  days: number;
  photoConsistency: number;
  routineConsistency: number;
  summary: string;
}

export const ShareCardTemplate = forwardRef<View, ShareCardTemplateProps>(
  function ShareCardTemplate(
    { beforeUri, afterUri, days, photoConsistency, routineConsistency, summary },
    ref
  ) {
    return (
      <View ref={ref} className="bg-background w-[360px] rounded-3xl overflow-hidden">
        <LinearGradient colors={['#FAF7F8', '#FDE8F0']} className="p-6">
          <Text className="text-stone-400 text-sm tracking-widest uppercase mb-1">
            SkinJournal
          </Text>
          <Text className="text-stone-900 text-2xl font-semibold mb-6">{days} Day Journey</Text>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-stone-500 text-xs mb-1">Day 1</Text>
              <Image source={{ uri: beforeUri }} className="w-full aspect-[3/4] rounded-2xl" />
            </View>
            <View className="flex-1">
              <Text className="text-stone-500 text-xs mb-1">Today</Text>
              <Image source={{ uri: afterUri }} className="w-full aspect-[3/4] rounded-2xl" />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1 bg-white/60 rounded-2xl p-3">
              <Text className="text-stone-500 text-xs">Photos</Text>
              <Text className="text-stone-900 text-lg font-semibold">{photoConsistency}%</Text>
            </View>
            <View className="flex-1 bg-white/60 rounded-2xl p-3">
              <Text className="text-stone-500 text-xs">Routine</Text>
              <Text className="text-stone-900 text-lg font-semibold">{routineConsistency}%</Text>
            </View>
          </View>

          <Text className="text-stone-700 text-sm leading-5 italic">"{summary}"</Text>
        </LinearGradient>
      </View>
    );
  }
);
