import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDatabase } from '../../src/db/provider';
import { getAllPlantsWithSchedule, updateLastWatered } from '../../src/db/queries';
import { cancelNotification, requestPermissions, scheduleWateringNotification } from '../../src/notifications/scheduler';
import { PlantWithSchedule, WateringSchedule } from '../../src/types/plant';
import { PlantCard } from '../../src/ui/PlantCard';
import { EmptyState } from '../../src/ui/EmptyState';
import { FAB } from '../../src/ui/FAB';
import { colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';

export default function MyPlantsScreen() {
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();
  const [plants, setPlants] = useState<PlantWithSchedule[]>([]);

  const loadPlants = useCallback(async () => {
    const all = await getAllPlantsWithSchedule(db);
    setPlants(all);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  function toSchedule(plant: PlantWithSchedule): WateringSchedule | null {
    if (plant.schedule_id == null) return null;
    return {
      id: plant.schedule_id,
      plant_id: plant.id,
      interval_days: plant.interval_days!,
      last_watered_at: plant.last_watered_at,
      notification_id: plant.notification_id,
    };
  }

  async function handleWater(plant: PlantWithSchedule) {
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

  const subtitle =
    plants.length > 0
      ? t('myPlants.subtitle_other', { count: plants.length })
      : t('myPlants.startCollection');

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {plants.length === 0 ? (
          <ScrollView contentContainerStyle={styles.scrollEmpty}>
            <Text style={styles.pageTitle}>{t('tabs.myPlants')}</Text>
            <Text style={styles.pageSubtitle}>{subtitle}</Text>
            <EmptyState
              title={t('myPlants.emptyTitle')}
              message={t('myPlants.emptyMessage')}
              ctaLabel={t('myPlants.addFirstPlant')}
              onCta={() => router.push('/(tabs)/add')}
            />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.pageTitle}>{t('tabs.myPlants')}</Text>
            <Text style={styles.pageSubtitle}>{subtitle}</Text>
            {plants.map((item) => (
              <PlantCard
                key={item.id}
                plant={item}
                schedule={toSchedule(item)}
                onPress={() => router.push(`/plant/${item.id}`)}
                onWater={item.schedule_id != null ? () => handleWater(item) : undefined}
              />
            ))}
          </ScrollView>
        )}
        <FAB onPress={() => router.push('/(tabs)/add')} />
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
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 96,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  scrollEmpty: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.xl,
  },
});
