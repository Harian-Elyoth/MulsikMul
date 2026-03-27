import { Image, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSize, fontWeight, spacing } from './theme';

type LogoSize = 'sm' | 'md' | 'lg';

interface AppLogoProps {
  size?: LogoSize;
  layout?: 'horizontal' | 'vertical';
  /** Use white text for placement on dark/primary-colored backgrounds */
  light?: boolean;
}

const sizeMap = {
  sm: { image: 28, text: fontSize.md },
  md: { image: 44, text: fontSize.xl },
  lg: { image: 56, text: fontSize.xxl },
} as const;

export function AppLogo({ size = 'md', layout = 'horizontal', light = false }: AppLogoProps) {
  const { image: imageSize, text: textSize } = sizeMap[size];
  const textColor = light ? colors.textLight : colors.primaryDark;
  const gap = size === 'sm' ? spacing.xs : spacing.sm;

  return (
    <View style={[styles.base, layout === 'vertical' ? styles.vertical : styles.horizontal, { gap }]}>
      <Image
        source={require('../../assets/playstore.png')}
        style={{ width: imageSize, height: imageSize, borderRadius: borderRadius.sm }}
        resizeMode="contain"
      />
      <Text style={[styles.text, { fontSize: textSize, color: textColor }]}>물식물</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  text: {
    fontWeight: fontWeight.bold,
  },
});
