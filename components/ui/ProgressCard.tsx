import { Text, View } from 'react-native';
import { Card } from './Card';

interface ProgressCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function ProgressCard({ title, value, subtitle }: ProgressCardProps) {
  return (
    <Card className="bg-mint-light">
      <Text className="text-muted text-sm font-medium mb-1">{title}</Text>
      <Text className="text-ink text-2xl font-bold">{value}</Text>
      {subtitle ? <Text className="text-muted text-sm mt-2">{subtitle}</Text> : null}
    </Card>
  );
}
