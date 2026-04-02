import { useCallback, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Droplet, Leaf, Pencil, Trash2 } from 'lucide-react-native';
import { useDatabase } from '../../src/db/provider';
import {
  deletePlant,
  getPlantCareInfo,
  getPlantById,
  getWateringSchedule,
  updateLastWatered,
} from '../../src/db/queries';
import {
  cancelNotification,
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { LocalPlant, PlantCareInfo, WateringSchedule } from '../../src/types/plant';
import { getWateringStatus } from '../../src/utils/watering';
import { Button } from '../../src/ui/Button';
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from '../../src/ui/theme';

const badgeVariants = {
  overdue: { bg: colors.dangerLight, text: colors.danger },
  due_soon: { bg: colors.orangeLight, text: colors.orange },
  ok: { bg: colors.greenLight, text: colors.green },
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [plant, setPlant] = useState<LocalPlant | null>(null);
  const [schedule, setSchedule] = useState<WateringSchedule | null>(null);
  const [careInfo, setCareInfo] = useState<PlantCareInfo | null>(null);
  const [watering, setWatering] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Animation values
  const waterScale = useRef(new Animated.Value(1)).current;
  const dialogOpacity = useRef(new Animated.Value(0)).current;
  const dialogScale = useRef(new Animated.Value(0.95)).current;

  useFocusEffect(
    useCallback(() => {
      const plantId = parseInt(id, 10);
      if (isNaN(plantId)) return;
      getPlantById(db, plantId).then(setPlant);
      getWateringSchedule(db, plantId).then(setSchedule);
      getPlantCareInfo(db, plantId).then(setCareInfo);
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
      setSchedule({ ...schedule, last_watered_at: now, notification_id: notificationId });

      // Water confirm animation
      Animated.sequence([
        Animated.timing(waterScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(waterScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } finally {
      setWatering(false);
    }
  }

  function openDeleteDialog() {
    setDeleteModalVisible(true);
    Animated.parallel([
      Animated.timing(dialogOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(dialogScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 2 }),
    ]).start();
  }

  function closeDeleteDialog() {
    Animated.parallel([
      Animated.timing(dialogOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(dialogScale, { toValue: 0.95, duration: 150, useNativeDriver: true }),
    ]).start(() => setDeleteModalVisible(false));
  }

  async function confirmDelete() {
    if (!plant) return;
    closeDeleteDialog();
    // Small delay to let animation finish
    setTimeout(async () => {
      if (schedule?.notification_id) {
        await cancelNotification(schedule.notification_id);
      }
      await deletePlant(db, plant.id);
      router.back();
    }, 160);
  }

  if (!plant) {
    return (
      <LinearGradient colors={colors.backgroundGradient} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('plantDetail.loading')}</Text>
      </LinearGradient>
    );
  }

  const status = schedule ? getWateringStatus(schedule) : null;
  const badge = status ? badgeVariants[status] : null;

  const lastWatered = schedule?.last_watered_at
    ? new Date(schedule.last_watered_at).toLocaleDateString()
    : t('plantDetail.never');

  const daysAgo = schedule?.last_watered_at
    ? Math.floor((Date.now() - schedule.last_watered_at) / 86400000)
    : null;

  const acquiredDate = plant.acquired_at
    ? new Date(plant.acquired_at).toLocaleDateString('fr-FR')
    : null;

  const createdDate = new Date(plant.created_at).toLocaleDateString('fr-FR');

  const statusLabel = status
    ? t(`plantDetail.status.${status === 'due_soon' ? 'dueSoon' : status === 'ok' ? 'onTrack' : 'overdue'}`)
    : null;

  const careTips =
    i18n.language === 'fr'
      ? (careInfo?.care_tips_fr ?? careInfo?.care_tips)
      : i18n.language === 'ko'
      ? (careInfo?.care_tips_ko ?? careInfo?.care_tips)
      : careInfo?.care_tips;

  const hasCareInfo =
    careInfo &&
    (careInfo.sunlight || careInfo.poisonous_to_pets !== null || careTips);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scroll} bounces={true}>
          {/* Hero */}
          <View style={styles.hero}>
            {plant.photo_uri ? (
              <>
                <Image source={{ uri: plant.photo_uri }} style={styles.heroImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.30)']}
                  style={styles.heroOverlay}
                />
              </>
            ) : (
              <LinearGradient
                colors={['#059669', '#10B981', '#14B8A6']}
                style={styles.heroPlaceholder}
              >
                <Leaf size={64} stroke="rgba(255,255,255,0.7)" />
              </LinearGradient>
            )}
            <Pressable style={[styles.backButton, { top: insets.top + 12 }]} onPress={() => router.back()}>
              <ArrowLeft size={20} stroke={colors.text} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.plantName}>{plant.nickname ?? plant.name}</Text>
            {plant.nickname ? (
              <Text style={styles.plantSpecies}>{plant.name}</Text>
            ) : plant.species ? (
              <Text style={styles.plantSpecies}>{plant.species}</Text>
            ) : null}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Animated.View style={[styles.actionButton, { transform: [{ scale: waterScale }] }]}>
                <Button
                  variant="blue"
                  size="lg"
                  label={watering ? t('plantDetail.watering') : t('plantDetail.waterNow')}
                  icon={Droplet}
                  onPress={handleWaterNow}
                  disabled={watering || !schedule}
                  style={{ flex: 1 }}
                />
              </Animated.View>
              <Button
                variant="outline"
                size="lg"
                label={t('plantDetail.edit')}
                icon={Pencil}
                onPress={() => router.push(`/plant-edit/${plant?.id}`)}
                disabled={!plant}
                style={styles.actionButton}
              />
            </View>

            {/* Plant Info card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('plantDetail.plantInfo')}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('plantDetail.dateAdded')}</Text>
                <Text style={styles.infoValue}>{acquiredDate ?? createdDate}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('plantDetail.lastWatered')}</Text>
                <Text style={styles.infoValue}>
                  {lastWatered}
                  {daysAgo !== null && daysAgo > 0
                    ? ` (${t('plantDetail.days_ago', { days: daysAgo })})`
                    : null}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('plantDetail.wateringInterval')}</Text>
                <Text style={styles.infoValue}>
                  {schedule
                    ? t('plantDetail.every_days', { days: schedule.interval_days })
                    : '—'}
                </Text>
              </View>
              {status && badge && statusLabel ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('plantDetail.status_label')}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{statusLabel}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>

            {/* Care info card */}
            {hasCareInfo ? (
              <View style={[styles.card, { marginTop: spacing.md }]}>
                <Text style={styles.cardTitle}>{t('plantDetail.careInfo')}</Text>
                {careInfo!.sunlight ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('plantDetail.light')}</Text>
                    <Text style={styles.infoValue}>{careInfo!.sunlight}</Text>
                  </View>
                ) : null}
                {careInfo!.poisonous_to_pets !== null ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('plantDetail.poisonousForPets')}</Text>
                      <Text style={styles.infoValue}>
                        {careInfo!.poisonous_to_pets === 1 ? t('common.yes') : t('common.no')}
                      </Text>
                    </View>
                  </>
                ) : null}
                {careTips ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('plantDetail.tips')}</Text>
                    </View>
                    <Text style={styles.careTips}>{careTips}</Text>
                  </>
                ) : null}
              </View>
            ) : null}

            {/* Delete button */}
            <Button
              variant="deleteOutline"
              size="lg"
              label={t('plantDetail.deletePlant')}
              icon={Trash2}
              onPress={openDeleteDialog}
              style={styles.deleteButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Delete confirmation dialog */}
      {deleteModalVisible ? (
        <Animated.View style={[styles.overlay, { opacity: dialogOpacity }]}>
          <Animated.View style={[styles.dialog, { transform: [{ scale: dialogScale }] }]}>
            <Text style={styles.dialogTitle}>
              {t('plantDetail.deleteTitle')}
            </Text>
            <Text style={styles.dialogMessage}>
              {t('plantDetail.deleteMessage', { name: plant.name })}
            </Text>
            <View style={styles.dialogButtons}>
              <Button
                variant="outline"
                size="md"
                label={t('common.cancel')}
                onPress={closeDeleteDialog}
                style={styles.dialogButton}
              />
              <Button
                variant="destructive"
                size="md"
                label={t('common.delete')}
                onPress={confirmDelete}
                style={styles.dialogButton}
              />
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 288,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 288,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 288,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  plantName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: fontSize.lg,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  badge: {
    borderRadius: borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  careTips: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    paddingBottom: 10,
  },
  deleteButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxWidth: '90%',
    width: '100%',
    ...shadows.lg,
  },
  dialogTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
  },
  dialogButton: {
    flex: 1,
  },
});
