import { View, type ViewProps } from 'react-native';
import { useColorScheme } from 'nativewind';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={`bg-surface rounded-[28px] p-5 shadow-sm border border-stone-200/80 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: isDark ? 0.25 : 0.04,
        shadowRadius: isDark ? 16 : 12,
        shadowOffset: { width: 0, height: 4 },
      }}
      {...props}
    >
      {children}
    </View>
  );
}
