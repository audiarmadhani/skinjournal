import { ScrollView, type ScrollViewProps } from 'react-native';

interface HorizontalBleedScrollProps extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  /** Matches parent horizontal padding (Tailwind px-5 → 20) */
  bleedHorizontal?: number;
}

export function HorizontalBleedScroll({
  children,
  className = '',
  bleedHorizontal = 20,
  ...props
}: HorizontalBleedScrollProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`mb-6 self-stretch ${className}`}
      style={{ marginHorizontal: -bleedHorizontal }}
      contentContainerStyle={{
        paddingLeft: bleedHorizontal,
        paddingRight: bleedHorizontal,
        alignItems: 'stretch',
      }}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
