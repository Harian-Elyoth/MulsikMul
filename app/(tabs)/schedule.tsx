import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useDatabase } from '../../src/db/provider';
import { getAllPlantsWithSchedule, updateLastWatered } from '../../src/db/queries';
import {
  cancelNotification,
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { PlantWithSchedule } from '../../src/types/plant';
import {
  formatDaysUntilWatering,
  getDaysUntilWatering,
  getWateringStatus,
} from '../../src/utils/watering';
import { EmptyState } from '../../src/ui/EmptyState';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';

const statusColors = {
  overdue: colors.overdue,
  due_soon: colors.dueSoon,
  ok: colors.ok,
};

export default function ScheduleScreen() {
  const db = useDatabase();
  const { t } = useTranslation();
  const [plants, setPlants] = useState<PlantWithSchedule[]>([]);

  const loadPlants = useCallback(async () => {
    const all = await getAllPlantsWithSchedule(db);
    const sorted = all
      .filter((p) => p.schedule_id != null)
      .sort((a, b) => {
        const daysA = getDaysUntilWatering({
          id: a.schedule_id!, plant_id: a.id,
          interval_days: a.interval_days!, last_watered_at: a.last_watered_at,
          notification_id: a.notification_id,
        });
        const daysB = getDaysUntilWatering({
          id: b.schedule_id!, plant_id: b.id,
          interval_days: b.interval_days!, last_watered_at: b.last_watered_at,
          notification_id: b.notification_id,
        });
        return daysA - daysB;
      });
    setPlants(sorted);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  async function handleWaterNow(plant: PlantWithSchedule) {
    if (plant.notification_id) {
      await cancelNotification(plant.notification_id);
    }

    const now = Date.now();
    let notificationId: string | null = null;
    const granted = await requestPermissions();
    if (granted) {
      notificationId = await scheduleWateringNotification(
        plant.id,
        plant.name,
        plant.interval_days!,
        now
      );
    }

    await updateLastWatered(db, plant.id, now, notificationId);
    await loadPlants();
  }

  if (plants.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('schedule.emptyTitle')}
          message={t('schedule.emptyMessage')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const schedule = {
            id: item.schedule_id!,
            plant_id: item.id,
            interval_days: item.interval_days!,
            last_watered_at: item.last_watered_at,
            notification_id: item.notification_id,
          };
          const status = getWateringStatus(schedule);

          return (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.statusText, { color: statusColors[status] }]}>
                  {formatDaysUntilWatering(schedule, t)}
                </Text>
              </View>
              <Pressable
                style={styles.waterButton}
                onPress={() => handleWaterNow(item)}
              >
                <Text style={styles.waterButtonText}>💧</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  statusText: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  waterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  waterButtonText: {
    fontSize: 20,
  },
});
