import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PillTag, StreakWidget } from '@/components/ui';
import { useProfile } from '@/hooks/useProfile';
import { usePremium } from '@/hooks/usePremium';
import { useStreak } from '@/hooks/useStreak';
import { usePhotos } from '@/hooks/usePhotos';
import { data } from '@/services/data-provider';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/hooks/useAppColors';
import { clearAuthAndOnboarding } from '@/services/onboarding-session';
import { SKIN_GOALS } from '@/store/onboarding-store';

const SETTINGS = [
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: 'person-outline' as const,
  },
  { label: 'Notifications', href: '/settings/notifications', icon: 'notifications-outline' as const },
  { label: 'Privacy', href: '/settings/privacy', icon: 'shield-outline' as const },
  { label: 'Data export', href: '/settings/export', icon: 'download-outline' as const },
  { label: 'Appearance', href: '/settings/appearance', icon: 'color-palette-outline' as const },
];

export default function ProfileScreen() {
  const colors = useAppColors();
  const { data: profile } = useProfile();
  const { isPremium } = usePremium();
  const { data: streak } = useStreak();
  const { data: photos } = usePhotos();
  const queryClient = useQueryClient();

  const goalLabels = (profile?.skin_goals ?? [])
    .map((g) => SKIN_GOALS.find((s) => s.id === g)?.label)
    .filter(Boolean);

  const handleSignOut = async () => {
    await data.signOut();
    clearAuthAndOnboarding();
    queryClient.clear();
    router.replace('/(auth)/login');
  };

  const handleRestartOnboarding = async () => {
    try {
      await data.updateProfile({
        onboarding_completed: false,
        baseline_photo_id: null,
      });
    } catch {
      // Profile update may fail if session expired — still restart via sign-in.
    }
    await data.signOut();
    clearAuthAndOnboarding();
    queryClient.clear();
    router.replace('/(auth)/login?restart=1');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5">
        <View className="pt-2 mb-4">
          <Text className="text-ink text-2xl font-bold">Profile</Text>
        </View>

        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-pink items-center justify-center mb-3">
            <Text className="text-ink text-3xl font-bold">
              {(profile?.name ?? 'A')[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-ink text-xl font-bold">{profile?.name ?? 'User'}</Text>
          <View className="flex-row flex-wrap justify-center gap-2 mt-3 px-4">
            {goalLabels.map((g) => (
              <PillTag key={g} label={g!} variant="outline" />
            ))}
          </View>
        </View>

        <StreakWidget days={streak?.current_streak ?? 0} />

        <Card className="mt-5 mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-sm">Photos uploaded</Text>
            <Text className="text-ink text-3xl font-bold mt-1">{photos?.length ?? 0}</Text>
          </View>
          <Text className="text-4xl">📷</Text>
        </Card>

        <Pressable onPress={() => router.push('/subscribe')} className="mb-3">
          <Card className="flex-row items-center justify-between bg-pink-light">
            <View className="flex-1">
              <Text className="text-ink font-bold">
                {isPremium ? 'Premium active' : 'Upgrade to Premium'}
              </Text>
              <Text className="text-muted text-sm mt-1">
                {isPremium ? 'Face analysis enabled' : 'Unlock AI face analysis'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.ink} />
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/share/generate')} className="mb-5">
          <Card className="flex-row items-center justify-between bg-peach">
            <Text className="text-ink font-bold">Create share card</Text>
            <Ionicons name="share-outline" size={22} color={colors.ink} />
          </Card>
        </Pressable>

        <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          Settings
        </Text>
        {SETTINGS.map((s) => (
          <Pressable key={s.label} onPress={() => router.push(s.href as never)}>
            <Card className="flex-row items-center py-4 mb-2">
              <View className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center mr-3">
                <Ionicons name={s.icon} size={20} color={colors.ink} />
              </View>
              <Text className="text-ink font-medium flex-1">{s.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Card>
          </Pressable>
        ))}

        <Pressable onPress={handleRestartOnboarding} className="mt-4 mb-2 items-center py-4">
          <Text className="text-ink font-medium">Redo skin setup</Text>
        </Pressable>

        <Pressable onPress={handleSignOut} className="mb-4 items-center py-4">
          <Text className="text-muted font-medium">Sign out</Text>
        </Pressable>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
