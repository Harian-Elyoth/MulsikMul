import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet } from 'lucide-react-native';
import { useDatabase } from '../db/provider';
import { getAllPlantsWithSchedule, updateLastWatered } from '../db/queries';
import {
  cancelNotification,
  requestPermissions,
  scheduleWateringNotification,
} from '../notifications/scheduler';
import { PlantWithSchedule } from '../types/plant';
import { getDaysUntilWatering, getWateringStatus } from '../utils/watering';
import { EmptyState } from '../ui/EmptyState';
import { FAB } from '../ui/FAB';
import { Button } from '../ui/Button';
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from '../ui/theme';
import { useRouter } from 'expo-router';

interface Props {
  onNavigateToAdd: () => void;
  refreshKey: number;
  topInset?: number;
}

export default function ScheduleScreen({ onNavigateToAdd, refreshKey, topInset = 0 }: Props) {
  const db = useDatabase();
  const { t } = useTranslation();
  const router = useRouter();
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

  useEffect(() => {
    loadPlants();
  }, [loadPlants, refreshKey]);

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

  function getUrgencyText(plant: PlantWithSchedule): { text: string; color: string } {
    const schedule = {
      id: plant.schedule_id!,
      plant_id: plant.id,
      interval_days: plant.interval_days!,
      last_watered_at: plant.last_watered_at,
      notification_id: plant.notification_id,
    };
    const status = getWateringStatus(schedule);
    const days = getDaysUntilWatering(schedule);
    switch (status) {
      case 'overdue':
        return { text: t('schedule.overdue'), color: colors.danger };
      case 'due_soon':
        return { text: t('schedule.dueSoon', { days: Math.abs(days) }), color: colors.orange };
      default:
        return { text: t('schedule.nextIn', { days }), color: colors.green };
    }
  }

  const ListHeader = (
    <View style={[styles.header, { paddingTop: spacing.lg + topInset }]}>
      <Text style={styles.pageTitle}>{t('tabs.schedule')}</Text>
      <Text style={styles.pageSubtitle}>{t('schedule.subtitle')}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {plants.length === 0 ? (
          <View style={styles.emptyWrapper}>
            {ListHeader}
            <EmptyState
              title={t('schedule.emptyTitle')}
              message={t('schedule.emptyMessage')}
            />
          </View>
        ) : (
          <FlatList
            data={plants}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const { text, color } = getUrgencyText(item);
              return (
                <View style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.urgencyText, { color }]}>{text}</Text>
                  </View>
                  <Button
                    variant="waterOutline"
                    size="sm"
                    label={t('plantDetail.water')}
                    icon={Droplet}
                    onPress={() => handleWaterNow(item)}
                  />
                </View>
              );
            }}
          />
        )}
        <FAB onPress={onNavigateToAdd} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  emptyWrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  list: {
    paddingBottom: 96,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  pageTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  plantName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  urgencyText: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
