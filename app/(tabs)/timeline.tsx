import { useMemo, useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { openCameraCapture } from '@/utils/camera-navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { TimelineCard, Card, EmptyState, ScreenHeader, PillTag, PrimaryButton } from '@/components/ui';
import { TabSlideScreen } from '@/components/navigation/TabSlideScreen';
import { usePhotos } from '@/hooks/usePhotos';
import { data } from '@/services/data-provider';
import { confirmAction, showMessage } from '@/utils/confirm';
import { formatMonthYear } from '@/utils/dates';
import { groupPhotosIntoSessions, type PhotoSessionGroup } from '@/utils/photo-sessions';
import { useAppColors } from '@/hooks/useAppColors';

export default function TimelineScreen() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const { data: photos, isLoading } = usePhotos();
  const [selected, setSelected] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sessions = useMemo(() => groupPhotosIntoSessions(photos ?? []), [photos]);

  const grouped = useMemo(() => {
    const map = new Map<string, PhotoSessionGroup[]>();
    for (const session of sessions) {
      const month = formatMonthYear(session.date);
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(session);
    }
    return Array.from(map.entries());
  }, [sessions]);

  const exitModes = () => {
    setCompareMode(false);
    setSelectMode(false);
    setSelected([]);
  };

  const toggleSelectMode = () => {
    if (selectMode) {
      exitModes();
      return;
    }
    setCompareMode(false);
    setSelectMode(true);
    setSelected([]);
  };

  const handleSelect = (primaryId: string) => {
    if (selectMode) {
      setSelected((prev) =>
        prev.includes(primaryId) ? prev.filter((p) => p !== primaryId) : [...prev, primaryId]
      );
      return;
    }

    if (compareMode) {
      setSelected((prev) => {
        if (prev.includes(primaryId)) return prev.filter((p) => p !== primaryId);
        if (prev.length >= 2) return [prev[1], primaryId];
        return [...prev, primaryId];
      });
      return;
    }

    router.push(`/photo/${primaryId}`);
  };

  const startCompare = () => {
    if (selected.length === 2) {
      router.push(`/timeline/compare?before=${selected[0]}&after=${selected[1]}`);
      exitModes();
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    const count = selected.length;
    const confirmed = await confirmAction(
      'Delete journal entries?',
      count === 1
        ? 'This entry and all its angles will be removed.'
        : `Remove ${count} journal entries? This cannot be undone.`,
      'Delete',
      true
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      for (const id of selected) {
        await data.deletePhoto(id);
      }
      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      exitModes();
    } catch (e) {
      showMessage('Could not delete', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <TabSlideScreen>
    {!isLoading && sessions.length === 0 ? (
      <SafeAreaView className="flex-1 bg-background">
        <EmptyState
          title="No photos yet"
          description="Take your first three-angle journal entry to start building your visual timeline."
          actionLabel="Take photos"
          onAction={() => openCameraCapture()}
        />
      </SafeAreaView>
    ) : (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5">
        <ScreenHeader title="My Journal" showBack={false} />

        {selectMode ? (
          <View className="flex-row items-center justify-between gap-3 mb-4">
            <Pressable onPress={exitModes} className="py-2">
              <Text className="text-muted font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-muted text-sm flex-1 text-center">
              {selected.length === 0
                ? 'Tap entries to select'
                : `${selected.length} selected`}
            </Text>
            <PrimaryButton
              title={deleting ? 'Deleting…' : 'Delete'}
              onPress={handleDeleteSelected}
              disabled={selected.length === 0 || deleting}
              className="px-5 py-2.5 min-w-[100px]"
            />
          </View>
        ) : (
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => {
                if (compareMode && selected.length === 2) startCompare();
                else {
                  setSelectMode(false);
                  setCompareMode(!compareMode);
                  setSelected([]);
                }
              }}
              className={`rounded-full px-4 py-2 ${compareMode ? 'bg-pink-dark' : 'bg-pink'}`}
            >
              <Text className="text-ink text-sm font-bold">
                {compareMode ? (selected.length === 2 ? 'Compare' : 'Pick 2 entries') : 'Compare'}
              </Text>
            </Pressable>
            <Pressable
              onPress={toggleSelectMode}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
            </Pressable>
          </View>
        )}

        {grouped.map(([month, monthSessions]) => (
          <View key={month} className="mb-8">
            <Text className="text-ink font-bold text-lg mb-3">{month}</Text>
            <View className="flex-row flex-wrap -m-1">
              {monthSessions.map((session) => (
                <View key={session.primaryPhoto.id} className="w-1/3">
                  <TimelineCard
                    imageUrl={session.primaryPhoto.image_url}
                    date={session.date}
                    isBaseline={session.baseline}
                    multiAngle={session.isMultiAngle}
                    selected={selected.includes(session.primaryPhoto.id)}
                    onPress={() => handleSelect(session.primaryPhoto.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Card className="mb-10 bg-lavender-light">
          <PillTag label="Milestone" />
          <Text className="text-ink font-bold text-base mt-3">Consistency improved this month</Text>
          <Text className="text-muted text-sm mt-1">Compared with your baseline</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
    )}
    </TabSlideScreen>
  );
}
