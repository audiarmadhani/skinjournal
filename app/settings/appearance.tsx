import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ScreenHeader, ThemeOptionRow } from '@/components/ui';
import { THEME_OPTIONS } from '@/lib/theme-options';
import { useThemeStore } from '@/store/theme-store';

export default function AppearanceSettings() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const active = THEME_OPTIONS.find((o) => o.value === preference);

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <ScreenHeader title="Appearance" />
      <Card>
        <Text className="text-stone-800 font-medium mb-1">Theme</Text>
        <Text className="text-stone-500 text-sm mb-2">
          {active ? `${active.label} mode` : 'Choose how Skin Journal looks'}
        </Text>
        {THEME_OPTIONS.map((option, index) => (
          <ThemeOptionRow
            key={option.value}
            label={option.label}
            description={option.description}
            selected={preference === option.value}
            onPress={() => setPreference(option.value)}
            isLast={index === THEME_OPTIONS.length - 1}
          />
        ))}
      </Card>
    </SafeAreaView>
  );
}
