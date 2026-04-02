import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Droplet } from 'lucide-react-native';
import { LocalPlant, WateringSchedule } from '../types/plant';
import { formatDaysUntilWatering, getWateringStatus } from '../utils/watering';
import { borderRadius, colors, fontSize, fontWeight, shadows, spacing } from './theme';
import { Button } from './Button';

interface PlantCardProps {
  plant: LocalPlant;
  schedule: WateringSchedule | null;
  onPress: () => void;
  onWater?: () => void;
}

export function PlantCard({ plant, schedule, onPress, onWater }: PlantCardProps) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;
  const status = schedule ? getWateringStatus(schedule) : null;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.99,
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

  const lastWateredText = schedule?.last_watered_at
    ? formatDaysUntilWatering(schedule, t)
    : t('plantDetail.never');

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {plant.photo_uri ? (
            <Image source={{ uri: plant.photo_uri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Droplet size={32} stroke="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{plant.nickname ?? plant.name}</Text>
          {plant.nickname ? (
            <Text style={styles.species} numberOfLines={1}>{plant.name}</Text>
          ) : plant.species ? (
            <Text style={styles.species} numberOfLines={1}>{plant.species}</Text>
          ) : null}
          <View style={styles.bottomRow}>
            <Text style={styles.lastWatered} numberOfLines={1}>
              {lastWateredText}
            </Text>
            {onWater ? (
              <Button
                variant="waterOutline"
                size="sm"
                label={t('plantDetail.water')}
                icon={Droplet}
                onPress={onWater}
              />
            ) : null}
          </View>
        </View>

        {/* Chevron */}
        <ChevronRight size={16} stroke="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  image: {
    width: 96,
    height: 96,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  species: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  lastWatered: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.sm,
  },
});
