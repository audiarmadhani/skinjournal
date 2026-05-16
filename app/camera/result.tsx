import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import { PrimaryButton, Card, InsightCard } from '@/components/ui';
import { PaywallCard } from '@/features/subscription/components/PaywallCard';
import { useCameraStore } from '@/store/camera-store';
import { data } from '@/services/data-provider';
import { generateAIInsights } from '@/services/openai';
import { useQueryClient } from '@tanstack/react-query';
import { todayISO } from '@/utils/dates';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { usePhotos } from '@/hooks/usePhotos';
import { colors } from '@/lib/theme';
import { completeOnboardingFlow } from '@/services/onboarding-sync';
import { exitCameraFlow } from '@/utils/camera-navigation';

export default function ResultScreen() {
  const { analyzing } = useLocalSearchParams<{ analyzing?: string }>();
  const { captureUri, isBaseline, lightingQuality, reset } = useCameraStore();
  const runAnalysis = analyzing === 'true';
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [analysisSkipped, setAnalysisSkipped] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();
  const { data: photos } = usePhotos();
  const saveStartedRef = useRef(false);
  const isLeavingRef = useRef(false);

  const baseline = photos?.find((p) => p.baseline);
  const todayPhoto = photos?.[0];

  useEffect(() => {
    if (!captureUri && !isLeavingRef.current) {
      router.replace('/camera/capture');
    }
  }, [captureUri]);

  useEffect(() => {
    if (!captureUri || saveStartedRef.current) return;
    saveStartedRef.current = true;

    const process = async () => {
      setLoading(true);
      setSaveError(null);
      setSaved(false);

      try {
        await data.ensureProfile();

        const photo = await data.uploadPhoto({
          user_id: '',
          image_url: captureUri,
          localUri: captureUri,
          date: todayISO(),
          metadata: {
            time: new Date().toLocaleTimeString(),
            lighting_quality: lightingQuality,
            device_info: Device.modelName ?? 'Unknown',
          },
          baseline: isBaseline,
        });

        if (runAnalysis) {
          const { insights: generated, source } = await generateAIInsights({
            daysSinceBaseline: 14,
            streak: 12,
            routinePercent: 83,
            compareWithLastWeek: true,
          });

          setInsights(generated);

          try {
            const profile = await data.getProfile();
            await data.createInsight({
              photo_id: photo.id,
              user_id: profile.id,
              summary: generated[0],
              generated_at: new Date().toISOString(),
              source,
            });
          } catch {
            // Insight save failed — photo still saved
          }
        } else {
          setAnalysisSkipped(true);
          setInsights([]);
        }

        try {
          if (isBaseline) {
            await completeOnboardingFlow();
            await data.updateProfile({ baseline_photo_id: photo.id });
          }
        } catch {
          if (isBaseline) {
            await completeOnboardingFlow();
          }
        }

        await queryClient.invalidateQueries();
        track(AnalyticsEvents.photoCaptured);
        setSaved(true);
      } catch (error) {
        saveStartedRef.current = false;
        const message =
          error instanceof Error ? error.message : 'Could not save your photo. Please try again.';
        setSaveError(message);
      } finally {
        setLoading(false);
      }
    };

    void process();
  }, [captureUri, runAnalysis, isBaseline, lightingQuality, queryClient, retryCount]);

  const handleDone = () => {
    if (!saved) {
      if (saveError) {
        Alert.alert('Photo not saved', saveError);
      }
      return;
    }
    isLeavingRef.current = true;
    exitCameraFlow();
  };

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.pink} />
        <Text className="text-muted mt-4 text-base">
          {runAnalysis ? 'Analyzing your photo…' : 'Saving your photo…'}
        </Text>
      </SafeAreaView>
    );
  }

  if (saveError) {
    return (
      <SafeAreaView className="flex-1 bg-background px-5 justify-center">
        <Text className="text-ink text-2xl font-bold mb-3">Couldn&apos;t save photo</Text>
        <Text className="text-muted text-base leading-6 mb-8">{saveError}</Text>
        <PrimaryButton title="Try again" onPress={handleRetry} className="mb-3" />
        <PrimaryButton
          title="Back to camera"
          variant="secondary"
          onPress={() => {
            reset();
            router.replace('/camera/capture');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-ink text-2xl font-bold mb-4">
          {runAnalysis ? "Today's update" : 'Photo saved'}
        </Text>
        {captureUri ? (
          <Image source={{ uri: captureUri }} className="w-full h-64 rounded-3xl mb-5" resizeMode="cover" />
        ) : null}

        {analysisSkipped ? (
          <PaywallCard
            compact
            title="Face analysis is Premium"
            description="Your photo is saved. Upgrade to get AI observations on redness, texture, and progress vs your baseline."
          />
        ) : null}

        {insights.map((text, i) => (
          <View key={i} className="mb-3">
            <InsightCard summary={text} label={i === 0 ? 'Observation' : 'Compared with last week'} />
          </View>
        ))}

        {baseline && todayPhoto && runAnalysis ? (
          <Card className="mb-5">
            <Text className="text-muted text-sm mb-2">Day 1 vs Today</Text>
            <View className="flex-row gap-2">
              <Image source={{ uri: baseline.image_url }} className="flex-1 h-24 rounded-xl" />
              <Image source={{ uri: captureUri! }} className="flex-1 h-24 rounded-xl" />
            </View>
          </Card>
        ) : null}

        <PrimaryButton
          title="Done"
          onPress={handleDone}
          disabled={!saved}
          className="mt-auto mb-6"
        />
      </View>
    </SafeAreaView>
  );
}
