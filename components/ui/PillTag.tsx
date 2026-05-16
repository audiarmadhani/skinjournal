import { Text, View } from 'react-native';

interface PillTagProps {
  label: string;
  variant?: 'default' | 'dark' | 'outline';
}

export function PillTag({ label, variant = 'default' }: PillTagProps) {
  const styles = {
    default: 'bg-surface/90',
    dark: 'bg-pink-light/60',
    outline: 'bg-transparent border border-stone-200',
  };
  const textStyles = {
    default: 'text-stone-800',
    dark: 'text-ink',
    outline: 'text-muted',
  };

  return (
    <View className={`rounded-full px-3 py-1.5 ${styles[variant]}`}>
      <Text className={`text-xs font-medium ${textStyles[variant]}`}>{label}</Text>
    </View>
  );
}
