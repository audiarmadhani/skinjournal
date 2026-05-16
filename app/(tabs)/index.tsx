import { useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  FeaturedCard,
  HomeHeader,
  InsightCard,
  PrimaryButton,
  ProgressCard,
  RoutineChecklist,
  SectionHeader,
  StreakWidget,
  WeekCalendarStrip,
  HorizontalBleedScroll,
} from '@/components/ui';
import { useProfile } from '@/hooks/useProfile';
import { usePremium } from '@/hooks/usePremium';
import { useStreak } from '@/hooks/useStreak';
import { useInsights } from '@/hooks/useInsights';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useProducts } from '@/hooks/useProducts';
import { usePhotos } from '@/hooks/usePhotos';
import { getWeekStripDates, todayISO } from '@/utils/dates';
import { buildRoutineItemsForType } from '@/utils/routine-items';
import { formatLogDate, isRoutineLogComplete, routineProgress } from '@/utils/routine';
import { useWeekRoutineLogs } from '@/hooks/useWeekRoutineLogs';
import { computeWeeklySummary } from '@/utils/weekly-summary';

export default function HomeScreen() {
  const { data: profile } = useProfile();
  const { canAnalyzeFace } = usePremium();
  const { data: streak } = useStreak();
  const { data: insights } = useInsights();
  const { data: routine, updateRoutine } = useTodayRoutine();
  const { data: weekLogs } = useWeekRoutineLogs();
  const { data: products } = useProducts();
  const { data: photos } = usePhotos();

  const today = todayISO();
  const todayPhoto = photos?.find((p) => p.date === today);
  const morningProducts = products?.filter((p) => p.routine_type === 'morning') ?? [];
  const nightProducts = products?.filter((p) => p.routine_type === 'night') ?? [];
  const allRoutineProducts = [...morningProducts, ...nightProducts];
  const { completed: routineDone, total: routineTotal, percent: routinePercent } = routineProgress(
    allRoutineProducts,
    routine,
    today
  );

  const morningSplit = buildRoutineItemsForType(allRoutineProducts, routine, today, 'morning');
  const nightSplit = buildRoutineItemsForType(allRoutineProducts, routine, today, 'night');

  const toggleMorning = async (id: string) => {
    const completed = routine?.morning_completed ?? [];
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id];
    try {
      await updateRoutine({ morning_completed: next });
    } catch (e) {
      Alert.alert('Could not save routine', e instanceof Error ? e.message : 'Try again.');
    }
  };

  const toggleNight = async (id: string) => {
    const completed = routine?.night_completed ?? [];
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id];
    try {
      await updateRoutine({ night_completed: next });
    } catch (e) {
      Alert.alert('Could not save routine', e instanceof Error ? e.message : 'Try again.');
    }
  };

  const weekly = useMemo(
    () => computeWeeklySummary(photos, allRoutineProducts, weekLogs, routine),
    [photos, allRoutineProducts, weekLogs, routine]
  );

  const routineCompletedDates = useMemo(() => {
    if (allRoutineProducts.length === 0) return new Set<string>();

    const logsByDate = new Map((weekLogs ?? []).map((log) => [log.date, log]));
    if (routine?.date) {
      logsByDate.set(routine.date, routine);
    }

    const completed = new Set<string>();
    for (const { date } of getWeekStripDates()) {
      if (isRoutineLogComplete(allRoutineProducts, logsByDate.get(date), date)) {
        completed.add(date);
      }
    }
    return completed;
  }, [weekLogs, routine, allRoutineProducts]);

  const latestInsight =
    insights?.[0]?.summary ?? 'Visible redness appears reduced compared with your baseline.';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4 }}
      >
        <HomeHeader name={profile?.name ?? 'there'} />
        <WeekCalendarStrip bleedHorizontal={20} completedDates={routineCompletedDates} />

        <SectionHeader title="My journey" />
        <HorizontalBleedScroll>
          <FeaturedCard
            title={todayPhoto ? "Today's photo" : 'Daily photo'}
            subtitle={
              todayPhoto
                ? 'Great work — your progress is saved.'
                : "Let's capture today's skin progress."
            }
            cta={todayPhoto ? 'View' : 'Take photo'}
            onPress={() =>
              todayPhoto ? router.push('/(tabs)/timeline') : router.push('/camera/capture')
            }
          />
          <FeaturedCard
            title="Routine log"
            subtitle={
              routineTotal > 0
                ? `${formatLogDate(today)} · ${routineDone}/${routineTotal} steps logged`
                : 'Set up your products and check them off daily.'
            }
            cta={routineTotal > 0 ? (routinePercent === 100 ? 'View log' : 'Log routine') : 'Set up'}
            variant="lavender"
            onPress={() => router.push('/routine/edit')}
          />
        </HorizontalBleedScroll>

        <StreakWidget days={streak?.current_streak ?? 0} />

        <SectionHeader
          title="Today's log"
          actionLabel={routineTotal > 0 ? 'Full log' : 'Set up'}
          onAction={() => router.push('/routine/edit')}
          className="pt-5"
        />
        {routineTotal === 0 ? (
          <Card className="mb-5">
            <Text className="text-muted text-base mb-4">
              Add your skincare steps to start logging each day.
            </Text>
            <PrimaryButton title="Set up routine" onPress={() => router.push('/routine/manage')} />
          </Card>
        ) : (
          <Card className="mb-5">
            <Text className="text-muted text-sm mb-3">
              {routinePercent}% complete · {routineDone} of {routineTotal} due today
            </Text>
            <RoutineChecklist
              title="Morning"
              items={morningSplit.due}
              onToggle={toggleMorning}
              compact
            />
            {morningSplit.notDue.length > 0 ? (
              <View className="mb-3">
                <Text className="text-muted text-xs font-medium uppercase tracking-wide mb-1">
                  Not due today
                </Text>
                <RoutineChecklist title="" items={morningSplit.notDue} onToggle={() => {}} compact />
              </View>
            ) : null}
            <RoutineChecklist title="Night" items={nightSplit.due} onToggle={toggleNight} compact />
            {nightSplit.notDue.length > 0 ? (
              <View>
                <Text className="text-muted text-xs font-medium uppercase tracking-wide mb-1">
                  Not due today
                </Text>
                <RoutineChecklist title="" items={nightSplit.notDue} onToggle={() => {}} compact />
              </View>
            ) : null}
          </Card>
        )}

        <SectionHeader
          title="Latest insight"
          actionLabel={canAnalyzeFace ? undefined : 'Premium'}
          onAction={canAnalyzeFace ? undefined : () => router.push('/subscribe')}
        />
        {canAnalyzeFace ? (
          <InsightCard summary={latestInsight} />
        ) : (
          <Card className="mb-5">
            <Text className="text-muted text-base leading-6">
              Upgrade to Premium for AI observations on your skin photos.
            </Text>
          </Card>
        )}

        <View className="mt-5 mb-10">
          <ProgressCard
            title="Weekly progress"
            value={`${weekly.photosThisWeek} photos`}
            subtitle={`Routine consistency: ${weekly.routineConsistency}%`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
