import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  className = '',
}: PrimaryButtonProps) {
  const colors = useAppColors();
  const base = 'rounded-[20px] py-4 px-6 items-center justify-center';
  const variants = {
    primary: 'bg-pink',
    secondary: 'bg-surface border border-stone-200',
    ghost: 'bg-transparent',
  };
  const textVariants = {
    primary: 'text-ink font-bold text-base',
    secondary: 'text-ink font-semibold text-base',
    ghost: 'text-muted font-medium text-base',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
