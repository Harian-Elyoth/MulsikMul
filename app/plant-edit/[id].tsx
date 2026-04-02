import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ArrowLeft, Camera, Upload, X } from 'lucide-react-native';
import { useDatabase } from '../../src/db/provider';
import {
  getPlantById,
  getWateringSchedule,
  updatePlant,
  upsertWateringSchedule,
} from '../../src/db/queries';
import {
  cancelNotification,
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { LocalPlant, WateringSchedule } from '../../src/types/plant';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';
import { Button } from '../../src/ui/Button';

function parseDateDDMMYYYY(value: string): number | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(date.getTime())) return null;
  return date.getTime();
}

function timestampToDDMMYYYY(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();

  const [plant, setPlant] = useState<LocalPlant | null>(null);
  const [schedule, setSchedule] = useState<WateringSchedule | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState('7');
  const [acquiredAt, setAcquiredAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const photoScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      const plantId = parseInt(id, 10);
      if (isNaN(plantId)) return;
      Promise.all([
        getPlantById(db, plantId),
        getWateringSchedule(db, plantId),
      ]).then(([p, s]) => {
        if (!p) return;
        setPlant(p);
        setSchedule(s);
        setName(p.name);
        setNickname(p.nickname ?? '');
        setSpecies(p.species ?? '');
        setNotes(p.notes ?? '');
        setPhotoUri(p.photo_uri ?? null);
        setIntervalDays(String(s?.interval_days ?? 7));
        setAcquiredAt(p.acquired_at ? timestampToDDMMYYYY(p.acquired_at) : '');
        setLoaded(true);
      });
    }, [db, id])
  );

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = `plant_${Date.now()}.jpg`;
      const dest = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });
      setPhotoUri(dest);
    }
  }

  async function handleSave() {
    if (!plant) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t('addPlant.errors.nameRequired'), t('addPlant.errors.nameRequiredMsg'));
      return;
    }

    const interval = parseInt(intervalDays, 10);
    if (isNaN(interval) || interval < 1) {
      Alert.alert(t('addPlant.errors.invalidInterval'), t('addPlant.errors.invalidIntervalMsg'));
      return;
    }

    let acquiredAtTimestamp: number | null = null;
    if (acquiredAt.trim()) {
      acquiredAtTimestamp = parseDateDDMMYYYY(acquiredAt.trim());
      if (acquiredAtTimestamp === null) {
        Alert.alert(t('addPlant.errors.invalidDate'), t('addPlant.errors.invalidDateMsg'));
        return;
      }
    }

    setSaving(true);
    try {
      await updatePlant(db, plant.id, {
        name: trimmedName,
        nickname: nickname.trim() || null,
        species: species.trim() || null,
        notes: notes.trim() || null,
        photo_uri: photoUri,
        acquired_at: acquiredAtTimestamp,
      });

      let notificationId = schedule?.notification_id ?? null;

      if (schedule && schedule.interval_days !== interval) {
        if (schedule.notification_id) {
          await cancelNotification(schedule.notification_id);
        }
        const granted = await requestPermissions();
        if (granted) {
          notificationId = await scheduleWateringNotification(
            plant.id,
            trimmedName,
            interval,
            schedule.last_watered_at ?? Date.now()
          );
        } else {
          notificationId = null;
        }
      }

      await upsertWateringSchedule(db, {
        plant_id: plant.id,
        interval_days: interval,
        last_watered_at: schedule?.last_watered_at ?? null,
        notification_id: notificationId,
      });

      router.back();
    } catch {
      Alert.alert(t('addPlant.errors.saveError'), t('addPlant.errors.saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  }

  function inputStyle(field: string) {
    return [styles.input, focusedField === field && styles.inputFocused];
  }

  if (!loaded) {
    return (
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('plantDetail.loading')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <ArrowLeft size={24} stroke={colors.text} />
            </Pressable>
            <Text style={styles.pageTitle}>{t('editPlant.title')}</Text>
            <View style={styles.backButton} />
          </View>

          {/* Photo picker */}
          {photoUri ? (
            <View style={styles.photoPicker}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <View style={styles.photoOverlay}>
                <Button
                  variant="ghost"
                  size="sm"
                  label={t('addPlant.changePhoto')}
                  icon={Camera}
                  onPress={pickImage}
                  style={{ borderRadius: borderRadius.lg }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  label={t('addPlant.removePhoto')}
                  icon={X}
                  onPress={() => setPhotoUri(null)}
                  style={{ borderRadius: borderRadius.lg }}
                />
              </View>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: photoScale }] }}>
              <Pressable
                style={styles.photoEmpty}
                onPress={pickImage}
                onPressIn={() =>
                  Animated.spring(photoScale, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
                }
                onPressOut={() =>
                  Animated.spring(photoScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
                }
              >
                <View style={styles.uploadIconCircle}>
                  <Upload size={24} stroke={colors.green} />
                </View>
                <Text style={styles.uploadLabel}>{t('addPlant.uploadPhoto')}</Text>
                <Text style={styles.uploadHint}>{t('addPlant.tapToSelect')}</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Name */}
          <Text style={styles.label}>{t('addPlant.nameLabel')}</Text>
          <TextInput
            style={inputStyle('name')}
            value={name}
            onChangeText={setName}
            placeholder={t('addPlant.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Nickname */}
          <Text style={[styles.label, styles.labelTop]}>{t('addPlant.nicknameLabel')}</Text>
          <TextInput
            style={inputStyle('nickname')}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t('addPlant.nicknamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            onFocus={() => setFocusedField('nickname')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Species */}
          <Text style={[styles.label, styles.labelTop]}>{t('addPlant.speciesLabel')}</Text>
          <TextInput
            style={inputStyle('species')}
            value={species}
            onChangeText={setSpecies}
            placeholder={t('addPlant.speciesPh')}
            placeholderTextColor={colors.textMuted}
            onFocus={() => setFocusedField('species')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Acquisition Date */}
          <Text style={[styles.label, styles.labelTop]}>{t('addPlant.acquisitionDate')}</Text>
          <TextInput
            style={inputStyle('acquiredAt')}
            value={acquiredAt}
            onChangeText={setAcquiredAt}
            placeholder={t('addPlant.datePlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onFocus={() => setFocusedField('acquiredAt')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Watering Interval */}
          <Text style={[styles.label, styles.labelTop]}>{t('addPlant.waterEvery')}</Text>
          <View style={styles.intervalRow}>
            <TextInput
              style={[inputStyle('interval'), styles.intervalInput]}
              value={intervalDays}
              onChangeText={setIntervalDays}
              keyboardType="number-pad"
              placeholder="7"
              placeholderTextColor={colors.textMuted}
              onFocus={() => setFocusedField('interval')}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.intervalSuffix}>{t('addPlant.days')}</Text>
          </View>

          {/* Notes */}
          <Text style={[styles.label, styles.labelTop]}>{t('addPlant.notesLabel')}</Text>
          <TextInput
            style={[inputStyle('notes'), styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('addPlant.notesPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            onFocus={() => setFocusedField('notes')}
            onBlur={() => setFocusedField(null)}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              size="lg"
              label={t('common.cancel')}
              onPress={() => router.back()}
              style={styles.actionButton}
            />
            <Button
              variant="green"
              size="lg"
              label={saving ? t('editPlant.saving') : t('editPlant.save')}
              onPress={handleSave}
              disabled={!name.trim() || saving}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  photoPicker: {
    height: 256,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 256,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  photoEmpty: {
    height: 192,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: 12,
  },
  uploadHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: 6,
  },
  labelTop: {
    marginTop: spacing.md,
  },
  input: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.green,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intervalInput: {
    width: 80,
  },
  intervalSuffix: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  notesInput: {
    height: undefined,
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
