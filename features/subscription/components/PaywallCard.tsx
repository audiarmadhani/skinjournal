import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Card, PrimaryButton } from '@/components/ui';
import { PREMIUM_FEATURES } from '@/lib/subscription';

interface PaywallCardProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function PaywallCard({
  title = 'Unlock face analysis',
  description = 'Upgrade to Premium to get AI-powered observations on your skin photos.',
  compact,
}: PaywallCardProps) {
  return (
    <Card className={compact ? 'mb-4' : 'mb-5'}>
      <View className="w-12 h-12 rounded-full bg-pink items-center justify-center mb-4">
        <Text className="text-xl">✨</Text>
      </View>
      <Text className="text-ink font-bold text-lg mb-2">{title}</Text>
      <Text className="text-muted text-base leading-6 mb-4">{description}</Text>
      {!compact ? (
        <View className="gap-2 mb-5">
          {PREMIUM_FEATURES.map((feature) => (
            <Text key={feature} className="text-ink text-sm">
              · {feature}
            </Text>
          ))}
        </View>
      ) : null}
      <PrimaryButton title="View Premium" onPress={() => router.push('/subscribe')} />
    </Card>
  );
}
