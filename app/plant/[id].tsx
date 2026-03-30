import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useDatabase } from '../../src/db/provider';
import {
  deletePlant,
  getPlantById,
  getWateringSchedule,
  updateLastWatered,
  upsertWateringSchedule,
} from '../../src/db/queries';
import {
  cancelNotification,
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { LocalPlant, WateringSchedule } from '../../src/types/plant';
import {
  formatDaysUntilWatering,
  getWateringStatus,
} from '../../src/utils/watering';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';

const statusLabels = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  ok: 'On Track',
};

const statusColors = {
  overdue: colors.overdue,
  due_soon: colors.dueSoon,
  ok: colors.ok,
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const router = useRouter();

  const [plant, setPlant] = useState<LocalPlant | null>(null);
  const [schedule, setSchedule] = useState<WateringSchedule | null>(null);
  const [watering, setWatering] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const plantId = parseInt(id, 10);
      if (isNaN(plantId)) return;

      getPlantById(db, plantId).then(setPlant);
      getWateringSchedule(db, plantId).then(setSchedule);
    }, [db, id])
  );

  async function handleWaterNow() {
    if (!plant || !schedule) return;
    setWatering(true);

    try {
      if (schedule.notification_id) {
        await cancelNotification(schedule.notification_id);
      }

      const now = Date.now();
      let notificationId: string | null = null;
      const granted = await requestPermissions();
      if (granted) {
        notificationId = await scheduleWateringNotification(
          plant.id,
          plant.name,
          schedule.interval_days,
          now
        );
      }

      await updateLastWatered(db, plant.id, now, notificationId);
      setSchedule({
        ...schedule,
        last_watered_at: now,
        notification_id: notificationId,
      });
    } finally {
      setWatering(false);
    }
  }

  function handleDelete() {
    if (!plant) return;

    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete "${plant.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (schedule?.notification_id) {
              await cancelNotification(schedule.notification_id);
            }
            await deletePlant(db, plant.id);
            router.back();
          },
        },
      ]
    );
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const status = schedule ? getWateringStatus(schedule) : null;
  const lastWatered = schedule?.last_watered_at
    ? new Date(schedule.last_watered_at).toLocaleDateString()
    : 'Never';
  const acquiredDate = plant.acquired_at
    ? new Date(plant.acquired_at).toLocaleDateString('fr-FR')
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {plant.photo_uri ? (
        <Image source={{ uri: plant.photo_uri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>🌿</Text>
        </View>
      )}

      <Text style={styles.name}>{plant.name}</Text>
      {plant.species && <Text style={styles.species}>{plant.species}</Text>}

      {schedule && status && (
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusBadge, { color: statusColors[status] }]}>
              {statusLabels[status]}
            </Text>
            <Text style={styles.statusDetail}>
              {formatDaysUntilWatering(schedule)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <InfoItem label="Interval" value={`Every ${schedule.interval_days} days`} />
            <InfoItem label="Last Watered" value={lastWatered} />
          </View>
          {acquiredDate && (
            <View style={[styles.infoRow, styles.infoRowTop]}>
              <InfoItem label="Acquired" value={acquiredDate} />
            </View>
          )}
        </View>
      )}

      {plant.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{plant.notes}</Text>
        </View>
      )}

      <Pressable
        style={[styles.waterButton, watering && styles.buttonDisabled]}
        onPress={handleWaterNow}
        disabled={watering || !schedule}
      >
        <Text style={styles.waterButtonText}>
          {watering ? 'Watering...' : '💧 Water Now'}
        </Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Plant</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 56,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  species: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statusSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  statusDetail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoRowTop: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  notesSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  notesText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  waterButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  waterButtonText: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  deleteButton: {
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
