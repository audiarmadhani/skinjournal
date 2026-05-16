import { useMemo, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ShareCardTemplate, PrimaryButton } from '@/components/ui';
import { usePhotos } from '@/hooks/usePhotos';
import { useInsights } from '@/hooks/useInsights';
import { useProducts } from '@/hooks/useProducts';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useWeekRoutineLogs } from '@/hooks/useWeekRoutineLogs';
import { computeWeeklySummary } from '@/utils/weekly-summary';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function ShareGenerateScreen() {
  const cardRef = useRef<View>(null);
  const { data: photos } = usePhotos();
  const { data: insights } = useInsights();
  const { data: products } = useProducts();
  const { data: routine } = useTodayRoutine();
  const { data: weekLogs } = useWeekRoutineLogs();
  const allProducts = products ?? [];
  const weekly = useMemo(
    () => computeWeeklySummary(photos, allProducts, weekLogs, routine),
    [photos, allProducts, weekLogs, routine]
  );

  const baseline = photos?.find((p) => p.baseline) ?? photos?.[photos.length - 1];
  const latest = photos?.[0];
  const summary =
    insights?.[0]?.summary ?? 'Visible skin texture appears more even compared with your baseline.';

  const exportCard = async (action: 'share' | 'save') => {
    if (!cardRef.current) return;
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (action === 'save') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') await MediaLibrary.saveToLibraryAsync(uri);
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
      track(AnalyticsEvents.shareExported, { action });
    } catch (e) {
      console.warn('Export failed', e);
    }
  };

  if (!baseline || !latest) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" contentContainerClassName="items-center py-6">
        <Text className="text-stone-900 text-xl font-semibold mb-6 self-start">Share your journey</Text>

        <ShareCardTemplate
          ref={cardRef}
          beforeUri={baseline.image_url}
          afterUri={latest.image_url}
          days={30}
          photoConsistency={Math.min(100, weekly.photosThisWeek * 14)}
          routineConsistency={weekly.routineConsistency}
          summary={summary}
        />

        <Text className="text-stone-500 text-sm mt-6 mb-4 self-start">Export as</Text>
        <PrimaryButton title="Instagram Story" onPress={() => exportCard('share')} className="w-full mb-2" />
        <PrimaryButton title="Save to photos" variant="secondary" onPress={() => exportCard('save')} className="w-full mb-2" />
        <PrimaryButton title="Share" variant="ghost" onPress={() => exportCard('share')} className="w-full" />
        <View className="h-4" />
        <PrimaryButton title="Close" variant="ghost" onPress={() => router.back()} className="w-full" />
      </ScrollView>
    </SafeAreaView>
  );
}
