import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, InsightCard, PrimaryButton, ScreenHeader } from '@/components/ui';
import { TabSlideScreen } from '@/components/navigation/TabSlideScreen';
import { PaywallCard } from '@/features/subscription/components/PaywallCard';
import { usePremium } from '@/hooks/usePremium';
import { useInsights } from '@/hooks/useInsights';
import { useStreak } from '@/hooks/useStreak';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { useEffect } from 'react';
import { openCameraCapture } from '@/utils/camera-navigation';

export default function InsightsScreen() {
  const { canAnalyzeFace } = usePremium();
  const { data: insights } = useInsights();
  const { data: streak } = useStreak();

  useEffect(() => {
    track(AnalyticsEvents.insightViewed);
  }, []);

  return (
    <TabSlideScreen>
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights" showBack={false} />

        <View className="items-center py-6 mb-4">
          <Text className="text-ink text-6xl font-bold">{streak?.current_streak ?? 0}</Text>
          <Text className="text-muted text-center text-base mt-2 px-8 leading-6">
            Celebrate the consistency you&apos;re building with your skin journey.
          </Text>
        </View>

        {canAnalyzeFace ? (
          <>
            <Card className="mb-5 bg-pink-light">
              <Text className="text-muted text-sm font-medium mb-2">Journey summary</Text>
              <Text className="text-ink text-base leading-6">
                Your skin appearance has remained stable. Visible changes may indicate progress from
                your routine over time.
              </Text>
            </Card>

            <Text className="text-ink font-bold text-lg mb-3">AI observations</Text>
            {(insights ?? []).length === 0 ? (
              <Text className="text-muted text-base mb-5">
                Take a photo with analysis enabled to generate observations.
              </Text>
            ) : (
              (insights ?? []).slice(0, 4).map((insight) => (
                <View key={insight.id} className="mb-3">
                  <InsightCard summary={insight.summary} label="Observation" />
                </View>
              ))
            )}
          </>
        ) : (
          <PaywallCard
            title="AI insights are Premium"
            description="Free accounts can track photos and routines. Upgrade for AI face analysis and personalized observations on every photo."
          />
        )}

        <PrimaryButton
          title="Take today's photo"
          onPress={() => openCameraCapture()}
          className="my-8"
        />
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
    </TabSlideScreen>
  );
}
