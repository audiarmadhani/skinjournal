import { Text } from 'react-native';
import { Card } from './Card';
import { PillTag } from './PillTag';

interface InsightCardProps {
  summary: string;
  label?: string;
}

export function InsightCard({ summary, label }: InsightCardProps) {
  return (
    <Card className="bg-lavender-light border-0">
      {label ? <PillTag label={label} variant="outline" /> : null}
      <Text className={`text-ink text-base leading-6 font-medium ${label ? 'mt-3' : ''}`}>
        {summary}
      </Text>
    </Card>
  );
}
