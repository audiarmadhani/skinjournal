import { useMemo, useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { TimelineCard, Card, EmptyState, ScreenHeader, PillTag, PrimaryButton } from '@/components/ui';
import { usePhotos } from '@/hooks/usePhotos';
import { data } from '@/services/data-provider';
import { confirmAction, showMessage } from '@/utils/confirm';
import { formatMonthYear } from '@/utils/dates';
import type { Photo } from '@/types';

export default function TimelineScreen() {
  const queryClient = useQueryClient();
  const { data: photos, isLoading } = usePhotos();
  const [selected, setSelected] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const grouped = useMemo(() => {
    if (!photos) return [];
    const map = new Map<string, Photo[]>();
    for (const photo of photos) {
      const month = formatMonthYear(photo.date);
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(photo);
    }
    return Array.from(map.entries());
  }, [photos]);

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

  const handleSelect = (id: string) => {
    if (selectMode) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
      return;
    }

    if (compareMode) {
      setSelected((prev) => {
        if (prev.includes(id)) return prev.filter((p) => p !== id);
        if (prev.length >= 2) return [prev[1], id];
        return [...prev, id];
      });
      return;
    }

    router.push(`/photo/${id}`);
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
      'Delete photos?',
      count === 1
        ? 'This photo will be removed from your journal.'
        : `Remove ${count} photos from your journal? This cannot be undone.`,
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

  if (!isLoading && (!photos || photos.length === 0)) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EmptyState
          title="No photos yet"
          description="Take your first photo to start building your visual timeline."
          actionLabel="Take photo"
          onAction={() => router.push('/camera/capture')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5">
        <ScreenHeader
          title="My Journal"
          showBack={false}
          rightIcon="more"
          onRightPress={toggleSelectMode}
        />

        {selectMode ? (
          <View className="flex-row items-center justify-between gap-3 mb-4">
            <Pressable onPress={exitModes} className="py-2">
              <Text className="text-muted font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-muted text-sm flex-1 text-center">
              {selected.length === 0
                ? 'Tap photos to select'
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
          <View className="flex-row justify-end mb-4">
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
                {compareMode ? (selected.length === 2 ? 'Compare' : 'Pick 2 photos') : 'Compare'}
              </Text>
            </Pressable>
          </View>
        )}

        {grouped.map(([month, monthPhotos]) => (
          <View key={month} className="mb-8">
            <Text className="text-ink font-bold text-lg mb-3">{month}</Text>
            <View className="flex-row flex-wrap -m-1">
              {monthPhotos.map((photo) => (
                <View key={photo.id} className="w-1/3">
                  <TimelineCard
                    imageUrl={photo.image_url}
                    date={photo.date}
                    isBaseline={photo.baseline}
                    selected={selected.includes(photo.id)}
                    onPress={() => handleSelect(photo.id)}
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
  );
}
