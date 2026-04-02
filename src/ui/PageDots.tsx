import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { colors } from './theme';

interface Props {
  total: number;
  current: number;
  onPress: (index: number) => void;
}

function Dot({ active, onPress }: { active: boolean; onPress: () => void }) {
  const width = useRef(new Animated.Value(active ? 20 : 8)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.35)).current;

  useEffect(() => {
    Animated.spring(width, {
      toValue: active ? 20 : 8,
      useNativeDriver: false,
      speed: 20,
      bounciness: 4,
    }).start();
    Animated.spring(opacity, {
      toValue: active ? 1 : 0.35,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  }, [active, width, opacity]);

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View style={[styles.dot, { width, opacity }]} />
    </Pressable>
  );
}

export default function PageDots({ total, current, onPress }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} onPress={() => onPress(i)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
});
