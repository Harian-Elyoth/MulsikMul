import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { borderRadius, colors, fontSize, fontWeight } from './theme';

type Variant =
  | 'primary'
  | 'green'
  | 'blue'
  | 'outline'
  | 'waterOutline'
  | 'destructive'
  | 'deleteOutline'
  | 'ghost';

type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ size: number; stroke: string }>;
  rounded?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string; pressedBg?: string }> = {
  primary:      { bg: '#030213', text: '#FFFFFF', pressedBg: '#030213' },
  green:        { bg: '#059669', text: '#FFFFFF', pressedBg: '#047857' },
  blue:         { bg: '#2563EB', text: '#FFFFFF', pressedBg: '#2563EB' },
  outline:      { bg: 'transparent', text: '#030213', border: '#E5E7EB', pressedBg: '#F9FAFB' },
  waterOutline: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', pressedBg: '#DBEAFE' },
  destructive:  { bg: '#D4183D', text: '#FFFFFF', pressedBg: '#D4183D' },
  deleteOutline:{ bg: 'transparent', text: '#D4183D', border: '#FECDD3', pressedBg: '#FFF1F2' },
  ghost:        { bg: 'transparent', text: '#030213', pressedBg: '#F3F4F6' },
};

const sizeStyles: Record<Size, { height: number; paddingH: number; fs: number; fw: string }> = {
  sm:   { height: 32, paddingH: 12, fs: fontSize.sm,  fw: fontWeight.medium },
  md:   { height: 36, paddingH: 16, fs: fontSize.md,  fw: fontWeight.medium },
  lg:   { height: 48, paddingH: 24, fs: fontSize.md,  fw: fontWeight.semibold },
  icon: { height: 36, paddingH: 0,  fs: fontSize.md,  fw: fontWeight.medium },
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  onPress,
  disabled = false,
  loading = false,
  icon: Icon,
  rounded = false,
  style,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  const radius = rounded ? borderRadius.full : borderRadius.lg;
  const isIcon = size === 'icon';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[
          styles.base,
          {
            height: ss.height,
            paddingHorizontal: isIcon ? 0 : ss.paddingH,
            width: isIcon ? ss.height : undefined,
            backgroundColor: vs.bg,
            borderRadius: radius,
            borderWidth: vs.border ? 1 : 0,
            borderColor: vs.border ?? 'transparent',
          },
          (disabled || loading) && styles.disabled,
        ]}
      >
        <View style={styles.inner}>
          {Icon && (
            <Icon
              size={16}
              stroke={vs.text}
            />
          )}
          {!isIcon && label !== undefined && (
            <Text
              style={[
                styles.label,
                {
                  fontSize: ss.fs,
                  fontWeight: ss.fw as any,
                  color: vs.text,
                  marginLeft: Icon ? 8 : 0,
                  includeFontPadding: false,
                },
              ]}
            >
              {loading ? '…' : label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
