import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useDatabase } from '../../src/db/provider';
import { getAllPlantsWithSchedule } from '../../src/db/queries';
import { PlantWithSchedule, WateringSchedule } from '../../src/types/plant';
import { PlantCard } from '../../src/ui/PlantCard';
import { EmptyState } from '../../src/ui/EmptyState';
import { colors, spacing } from '../../src/ui/theme';

export default function MyPlantsScreen() {
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();
  const [plants, setPlants] = useState<PlantWithSchedule[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPlantsWithSchedule(db).then(setPlants);
    }, [db])
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

  if (plants.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('myPlants.emptyTitle')}
          message={t('myPlants.emptyMessage')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            schedule={toSchedule(item)}
            onPress={() => router.push(`/plant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
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
});
