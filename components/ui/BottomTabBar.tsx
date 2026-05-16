import { Platform, View, Pressable, Text } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import { useAppColors } from '@/hooks/useAppColors';
import { openCameraCapture } from '@/utils/camera-navigation';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline' as const, iconActive: 'home' as const },
  { name: 'timeline', label: 'Journal', icon: 'book-outline' as const, iconActive: 'book' as const },
  { name: 'camera', label: '', icon: 'add' as const, iconActive: 'add' as const, isCenter: true },
  { name: 'insights', label: 'Insights', icon: 'bar-chart-outline' as const, iconActive: 'bar-chart' as const },
  { name: 'profile', label: 'Profile', icon: 'person-outline' as const, iconActive: 'person' as const },
];

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const colors = useAppColors();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="bg-surface flex-row items-end px-1 rounded-t-[28px] border-t border-stone-200/80"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 12,
        overflow: 'visible',
        zIndex: 100,
        elevation: 100,
        shadowColor: '#000',
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      }}
    >
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        const isCenter = tab.isCenter;

        if (isCenter) {
          return (
            <Link key={tab.name} href="/camera/capture" asChild>
              <Pressable
                onPress={() => openCameraCapture(undefined, navigation)}
                className="flex-1 items-center justify-end"
                style={{
                  marginTop: -32,
                  zIndex: 101,
                  elevation: 101,
                  ...(Platform.OS === 'web' ? { cursor: 'pointer' } : null),
                }}
                hitSlop={{ top: 16, bottom: 8, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
              >
                <View
                  className="w-[60px] h-[60px] rounded-full bg-pink items-center justify-center"
                  style={{
                    shadowColor: colors.pink,
                    shadowOpacity: 0.45,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <Ionicons name="add" size={32} color={colors.ink} />
                </View>
              </Pressable>
            </Link>
          );
        }

        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            className="flex-1 items-center py-2"
          >
            <Ionicons
              name={isFocused ? tab.iconActive : tab.icon}
              size={24}
              color={isFocused ? colors.ink : colors.muted}
            />
            <Text
              className={`text-[11px] mt-1 ${isFocused ? 'text-ink font-semibold' : 'text-muted'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
