import { useState, useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PrimaryButton, ScreenHeader } from '@/components/ui';
import { usePremium } from '@/hooks/usePremium';
import { PREMIUM_FEATURES } from '@/lib/subscription';
import { activatePremiumForTesting } from '@/services/subscription';
import { shouldUseMock } from '@/lib/env';
import { useQueryClient } from '@tanstack/react-query';
import { track } from '@/lib/analytics';

export default function SubscribeScreen() {
  const { isPremium, isLoading } = usePremium();
  const queryClient = useQueryClient();
  const [activating, setActivating] = useState(false);
  const showDevUnlock = shouldUseMock() || __DEV__;

  useEffect(() => {
    track('premium_screen_viewed');
  }, []);

  const handleDevUnlock = async () => {
    setActivating(true);
    try {
      await activatePremiumForTesting();
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Premium enabled', 'Face analysis is now unlocked for this account.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not activate premium.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Premium" showBack />

        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-full bg-pink items-center justify-center mb-4">
            <Text className="text-3xl">✨</Text>
          </View>
          <Text className="text-ink text-2xl font-bold text-center mb-2">SkinJournal Premium</Text>
          <Text className="text-muted text-center text-base leading-6 px-4">
            AI face analysis and personalized insights — built for paying members.
          </Text>
        </View>

        <Card className="mb-5">
          <Text className="text-ink font-bold text-lg mb-4">What you get</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature} className="flex-row mb-3">
              <Text className="text-pink mr-2">✓</Text>
              <Text className="text-ink flex-1 text-base">{feature}</Text>
            </View>
          ))}
        </Card>

        <Card className="mb-5 bg-surface">
          <Text className="text-muted text-sm font-medium mb-1">Free plan includes</Text>
          <Text className="text-ink text-base leading-6">
            Daily photos, routine logging, timeline, and streak tracking — no AI analysis.
          </Text>
        </Card>

        {isPremium ? (
          <Card className="mb-6 bg-pink/20 border border-pink/50">
            <Text className="text-ink font-bold text-center">
              You have Premium — face analysis is enabled
            </Text>
          </Card>
        ) : (
          <>
            <PrimaryButton
              title="Subscribe — coming soon"
              onPress={() => {
                track('premium_upgrade_tapped');
                Alert.alert(
                  'Coming soon',
                  'Connect App Store / Play Billing or RevenueCat to enable purchases. Until then, premium can be granted in Supabase (subscription_tier = premium).'
                );
              }}
              disabled={isLoading}
            />
            <Text className="text-muted text-xs text-center mt-3 mb-4 px-4">
              In-app purchases will be wired here. Set profiles.subscription_tier to premium in
              Supabase to unlock a user manually.
            </Text>
          </>
        )}

        {showDevUnlock && !isPremium ? (
          <PrimaryButton
            title="Enable Premium (dev)"
            variant="secondary"
            onPress={handleDevUnlock}
            loading={activating}
            disabled={activating}
            className="mb-10"
          />
        ) : (
          <View className="h-10" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
