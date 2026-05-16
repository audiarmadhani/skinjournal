import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PrimaryButton, RoutineLogProgress, ScreenHeader } from '@/components/ui';
import { RoutineLogSection } from '@/features/routine/components/RoutineLogSection';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useProducts } from '@/hooks/useProducts';
import { syncPendingOnboardingIfNeeded } from '@/services/onboarding-sync';
import { useQueryClient } from '@tanstack/react-query';
import { todayISO } from '@/utils/dates';
import { getProductsDueOnDate } from '@/utils/product-schedule';
import { buildRoutineItemsForType } from '@/utils/routine-items';
import { formatLogDate, routineProgress } from '@/utils/routine';
import { useAppColors } from '@/hooks/useAppColors';

export default function RoutineLogScreen() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const { data: routine, updateRoutine, isLoading: routineLoading, isSaving } = useTodayRoutine();
  const { data: products, isLoading: productsLoading } = useProducts();

  useFocusEffect(
    useCallback(() => {
      void syncPendingOnboardingIfNeeded().then((synced) => {
        if (synced) {
          void queryClient.invalidateQueries({ queryKey: ['products'] });
          void queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
        }
      });
    }, [queryClient])
  );

  const morning = products?.filter((p) => p.routine_type === 'morning') ?? [];
  const night = products?.filter((p) => p.routine_type === 'night') ?? [];
  const allProducts = [...morning, ...night];
  const today = todayISO();
  const { completed, total, percent } = routineProgress(allProducts, routine, today);

  const morningSplit = buildRoutineItemsForType(allProducts, routine, today, 'morning');
  const nightSplit = buildRoutineItemsForType(allProducts, routine, today, 'night');

  const toggle = async (id: string, type: 'morning' | 'night') => {
    if (!routine) return;
    const key = type === 'morning' ? 'morning_completed' : 'night_completed';
    const current = routine[key] ?? [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    try {
      await updateRoutine({ [key]: next });
    } catch (e) {
      Alert.alert('Could not save log', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const markAllDue = async (type: 'morning' | 'night') => {
    if (!routine) return;
    const list = type === 'morning' ? morning : night;
    const due = getProductsDueOnDate(list, today);
    if (due.length === 0) return;
    const key = type === 'morning' ? 'morning_completed' : 'night_completed';
    try {
      await updateRoutine({ [key]: due.map((p) => p.id) });
    } catch (e) {
      Alert.alert('Could not save log', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const loading = routineLoading || productsLoading;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Routine log" showBack />

        <Text className="text-muted text-base -mt-2 mb-5">{formatLogDate(today)}</Text>

        {loading ? (
          <ActivityIndicator className="my-12" color={colors.pink} />
        ) : allProducts.length === 0 ? (
          <Card className="mb-6">
            <Text className="text-ink font-bold text-lg mb-2">No routine yet</Text>
            <Text className="text-muted text-base leading-6 mb-5">
              Add the skincare steps and brands you use so you can check them off each day.
            </Text>
            <PrimaryButton
              title="Set up my routine"
              onPress={() => router.push('/routine/manage')}
            />
          </Card>
        ) : (
          <>
            <RoutineLogProgress completed={completed} total={total} percent={percent} />

            <Card className="mb-5">
              <RoutineLogSection
                title="Morning"
                emoji="☀️"
                dueItems={morningSplit.due}
                notDueItems={morningSplit.notDue}
                onToggle={(id) => toggle(id, 'morning')}
                onMarkAll={() => markAllDue('morning')}
                disabled={isSaving}
              />
              {morning.length > 0 && night.length > 0 ? (
                <View className="h-px bg-stone-100 my-1" />
              ) : null}
              <RoutineLogSection
                title="Night"
                emoji="🌙"
                dueItems={nightSplit.due}
                notDueItems={nightSplit.notDue}
                onToggle={(id) => toggle(id, 'night')}
                onMarkAll={() => markAllDue('night')}
                disabled={isSaving}
              />
            </Card>

            {percent === 100 && total > 0 ? (
              <Card className="mb-5 bg-pink/20 border border-pink/40">
                <Text className="text-ink font-bold text-center">
                  ✨ All due steps logged for today
                </Text>
              </Card>
            ) : null}
          </>
        )}

        <View className="items-center mb-10 mt-2">
          <Pressable
            onPress={() => router.push('/routine/manage')}
            className="flex-row items-center justify-center rounded-full bg-surface border border-stone-200 px-6 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Manage my products"
          >
            <Text className="text-ink font-semibold text-base">Manage my products</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
