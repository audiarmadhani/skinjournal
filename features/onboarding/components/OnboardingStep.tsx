import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingStepProps {
  headline: string;
  description?: string;
  children?: ReactNode;
}

export function OnboardingStep({ headline, description, children }: OnboardingStepProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-8">
        <Text className="text-ink text-3xl font-bold mt-8 mb-3 leading-tight">
          {headline}
        </Text>
        {description ? (
          <Text className="text-muted text-base leading-6 mb-8">{description}</Text>
        ) : null}
        <View className="flex-1">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
