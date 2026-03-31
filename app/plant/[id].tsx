import { useCallback, useState } from 'react';
import {
  Image,
  Modal,
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
import { useDatabase } from '../../src/db/provider';
import {
  deletePlant,
  getPlantCareInfo,
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
import { LocalPlant, PlantCareInfo, WateringSchedule } from '../../src/types/plant';
import {
  formatDaysUntilWatering,
  getWateringStatus,
} from '../../src/utils/watering';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';

const statusColors = {
  overdue: colors.overdue,
  due_soon: colors.dueSoon,
  ok: colors.ok,
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();

  const [plant, setPlant] = useState<LocalPlant | null>(null);
  const [schedule, setSchedule] = useState<WateringSchedule | null>(null);
  const [careInfo, setCareInfo] = useState<PlantCareInfo | null>(null);
  const [watering, setWatering] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
    setDeleteModalVisible(true);
  }

  async function confirmDelete() {
    if (!plant) return;
    setDeleteModalVisible(false);
    if (schedule?.notification_id) {
      await cancelNotification(schedule.notification_id);
    }
    await deletePlant(db, plant.id);
    router.back();
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('plantDetail.loading')}</Text>
      </View>
    );
  }

  const status = schedule ? getWateringStatus(schedule) : null;
  const lastWatered = schedule?.last_watered_at
    ? new Date(schedule.last_watered_at).toLocaleDateString()
    : t('plantDetail.never');
  const acquiredDate = plant.acquired_at
    ? new Date(plant.acquired_at).toLocaleDateString('fr-FR')
    : null;

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scroll}>
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
              {t(`plantDetail.status.${status === 'due_soon' ? 'dueSoon' : status === 'ok' ? 'onTrack' : 'overdue'}`)}
            </Text>
            <Text style={styles.statusDetail}>
              {formatDaysUntilWatering(schedule, t)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <InfoItem label={t('plantDetail.interval')} value={t('plantDetail.intervalValue', { days: schedule.interval_days })} />
            <InfoItem label={t('plantDetail.lastWatered')} value={lastWatered} />
          </View>
          {acquiredDate && (
            <View style={[styles.infoRow, styles.infoRowTop]}>
              <InfoItem label={t('plantDetail.acquired')} value={acquiredDate} />
            </View>
          )}
        </View>
      )}

      {careInfo && (careInfo.sunlight || careInfo.poisonous_to_pets !== null || careInfo.care_tips || careInfo.care_tips_fr || careInfo.care_tips_ko) && (
        <View style={styles.careSection}>
          <Text style={styles.sectionTitle}>{t('plantDetail.careInfo')}</Text>
          {careInfo.sunlight && (
            <InfoItem label={t('plantDetail.light')} value={careInfo.sunlight} />
          )}
          {careInfo.poisonous_to_pets !== null && (
            <InfoItem
              label={t('plantDetail.poisonousForPets')}
              value={careInfo.poisonous_to_pets === 1 ? t('common.yes') : t('common.no')}
            />
          )}
          {(careInfo.care_tips || careInfo.care_tips_fr || careInfo.care_tips_ko) && (
            <View style={styles.careTipsRow}>
              <Text style={styles.infoLabel}>{t('plantDetail.tips')}</Text>
              <Text style={styles.careTipsText}>
                {i18n.language === 'fr'
                  ? (careInfo.care_tips_fr ?? careInfo.care_tips)
                  : i18n.language === 'ko'
                  ? (careInfo.care_tips_ko ?? careInfo.care_tips)
                  : careInfo.care_tips}
              </Text>
            </View>
          )}
        </View>
      )}

      <Pressable
        style={[styles.waterButton, watering && styles.buttonDisabled]}
        onPress={handleWaterNow}
        disabled={watering || !schedule}
      >
        <Text style={styles.waterButtonText}>
          {watering ? t('plantDetail.watering') : t('plantDetail.waterNow')}
        </Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>{t('plantDetail.deletePlant')}</Text>
      </Pressable>
    </ScrollView>

    <Modal
      visible={deleteModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('plantDetail.deleteTitle')}</Text>
          <Text style={styles.modalMessage}>
            {t('plantDetail.deleteMessage', { name: plant.name })}
          </Text>
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.modalButtonCancelText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.modalButtonDelete]}
              onPress={confirmDelete}
            >
              <Text style={styles.modalButtonDeleteText}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </View>
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
  careSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  careTipsRow: {
    marginTop: spacing.sm,
  },
  careTipsText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonDelete: {
    backgroundColor: colors.danger,
  },
  modalButtonCancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  modalButtonDeleteText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textLight,
  },
});
