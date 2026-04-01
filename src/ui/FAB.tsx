import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, shadows } from './theme';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.93,
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

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Plus size={24} stroke="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    zIndex: 50,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
});
