import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LocalPlant, WateringSchedule } from '../types/plant';
import { formatDaysUntilWatering, getWateringStatus } from '../utils/watering';
import { borderRadius, colors, fontSize, fontWeight, spacing } from './theme';

interface PlantCardProps {
  plant: LocalPlant;
  schedule: WateringSchedule | null;
  onPress: () => void;
}

const statusColors = {
  overdue: { bg: colors.dangerLight, text: colors.overdue },
  due_soon: { bg: colors.warningLight, text: colors.dueSoon },
  ok: { bg: colors.successLight, text: colors.ok },
};

export function PlantCard({ plant, schedule, onPress }: PlantCardProps) {
  const { t } = useTranslation();
  const status = schedule ? getWateringStatus(schedule) : null;
  const statusStyle = status ? statusColors[status] : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {plant.photo_uri ? (
        <Image source={{ uri: plant.photo_uri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>🌿</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{plant.name}</Text>
        {plant.species && (
          <Text style={styles.species} numberOfLines={1}>{plant.species}</Text>
        )}
        {schedule && statusStyle && (
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {formatDaysUntilWatering(schedule, t)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  species: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
