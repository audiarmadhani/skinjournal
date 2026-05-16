import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, InsightCard, ProductTag } from '@/components/ui';
import { usePhoto, usePhotos } from '@/hooks/usePhotos';
import { useInsights } from '@/hooks/useInsights';
import { useProducts } from '@/hooks/useProducts';
import { usePremium } from '@/hooks/usePremium';
import { PaywallCard } from '@/features/subscription/components/PaywallCard';
import { formatDate } from '@/utils/dates';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: photo } = usePhoto(id);
  const { data: photos } = usePhotos();
  const { data: insights } = useInsights();
  const { data: products } = useProducts();
  const { canAnalyzeFace } = usePremium();

  if (!photo) return null;

  const sorted = [...(photos ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const idx = sorted.findIndex((p) => p.id === id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const insight = insights?.find((i) => i.photo_id === id);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <Pressable onPress={() => router.back()} className="px-5 pt-2">
          <Ionicons name="arrow-back" size={24} color="#1C1917" />
        </Pressable>
        <Image source={{ uri: photo.image_url }} className="w-full h-96 mt-2" resizeMode="cover" />
        <View className="px-5 py-5">
          <Text className="text-stone-900 text-xl font-semibold">{formatDate(photo.date)}</Text>
          {photo.baseline ? (
            <Text className="text-pink-dark text-sm mt-1">Baseline · Day 1</Text>
          ) : (
            <Text className="text-stone-500 text-sm mt-1">Streak day</Text>
          )}

          <Text className="text-stone-500 text-sm font-medium mt-6 mb-2">Products during this period</Text>
          <View className="flex-row flex-wrap">
            {(products ?? []).slice(0, 4).map((p) => (
              <ProductTag key={p.id} name={p.name} brand={p.brand} />
            ))}
          </View>

          {canAnalyzeFace && insight ? (
            <View className="mt-5">
              <InsightCard summary={insight.summary} label="AI insight on this date" />
            </View>
          ) : !canAnalyzeFace ? (
            <View className="mt-5">
              <PaywallCard compact title="AI insight — Premium" description="Upgrade to see AI analysis for this photo." />
            </View>
          ) : null}

          <View className="flex-row justify-between mt-8 gap-3">
            <Pressable
              disabled={!prev}
              onPress={() => prev && router.replace(`/photo/${prev.id}`)}
              className="flex-1"
            >
              <Card className="items-center py-3 opacity-100">
                <Ionicons name="chevron-back" size={20} color={prev ? '#1C1917' : '#D6D3D1'} />
                <Text className="text-stone-600 text-sm mt-1">Previous</Text>
              </Card>
            </Pressable>
            <Pressable
              onPress={() => {
                const baseline = photos?.find((p) => p.baseline);
                if (baseline) router.push(`/timeline/compare?before=${baseline.id}&after=${id}`);
              }}
              className="flex-1"
            >
              <Card className="items-center py-3">
                <Ionicons name="git-compare-outline" size={20} color="#1C1917" />
                <Text className="text-stone-600 text-sm mt-1">Compare</Text>
              </Card>
            </Pressable>
            <Pressable
              disabled={!next}
              onPress={() => next && router.replace(`/photo/${next.id}`)}
              className="flex-1"
            >
              <Card className="items-center py-3">
                <Ionicons name="chevron-forward" size={20} color={next ? '#1C1917' : '#D6D3D1'} />
                <Text className="text-stone-600 text-sm mt-1">Next</Text>
              </Card>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
