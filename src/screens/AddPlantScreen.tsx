import { useEffect, useRef, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camera, Upload, X } from 'lucide-react-native';
import { useDatabase } from '../db/provider';
import { insertPlant, insertPlantCareInfo, upsertWateringSchedule } from '../db/queries';
import {
  requestPermissions,
  scheduleWateringNotification,
} from '../notifications/scheduler';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../ui/theme';
import PlantSearchModal, { PlantSearchResult } from '../ui/PlantSearchModal';
import { Button } from '../ui/Button';

interface Props {
  onSaved: () => void;
  onCancel: () => void;
  isActive?: boolean;
  topInset?: number;
}

function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDateDDMMYYYY(value: string): number | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(date.getTime())) return null;
  return date.getTime();
}

export default function AddPlantScreen({ onSaved, onCancel, isActive, topInset = 0 }: Props) {
  const db = useDatabase();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState('7');
  const [saving, setSaving] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [perenualId, setPerenualId] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [acquiredAt, setAcquiredAt] = useState(todayDDMMYYYY);
  const [careInfo, setCareInfo] = useState<{
    sunlight: string | null;
    sunlight_fr: string | null;
    sunlight_ko: string | null;
    poisonous_to_pets: boolean | null;
    notes_fr: string | null;
    notes_ko: string | null;
  } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const photoScale = useRef(new Animated.Value(1)).current;

  function resetForm() {
    setName('');
    setNickname('');
    setSpecies('');
    setNotes('');
    setPhotoUri(null);
    setIntervalDays('7');
    setAcquiredAt(todayDDMMYYYY());
    setPerenualId(null);
    setAutoFilled(false);
    setCareInfo(null);
    setFocusedField(null);
  }

  useEffect(() => {
    if (isActive) {
      resetForm();
    }
  }, [isActive]);

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

  async function handleSearchSelect(data: PlantSearchResult) {
    setName(data.name);
    setSpecies(data.species);
    setIntervalDays(String(data.intervalDays));
    const lang = i18n.language;
    setNotes(lang === 'ko' ? data.notes_ko : lang === 'fr' ? data.notes_fr : data.notes);
    setPerenualId(data.perenualId);
    setAutoFilled(true);
    setCareInfo({
      sunlight: data.sunlight,
      sunlight_fr: data.sunlight_fr,
      sunlight_ko: data.sunlight_ko,
      poisonous_to_pets: data.poisonous_to_pets,
      notes_fr: data.notes_fr,
      notes_ko: data.notes_ko,
    });

    if (data.photoUrl) {
      try {
        const filename = `plant_${Date.now()}.jpg`;
        const dest = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.downloadAsync(data.photoUrl, dest);
        setPhotoUri(dest);
      } catch {
        // Photo download failed — continue without photo
      }
    }
  }

  function handleNameChange(text: string) {
    setName(text);
    if (autoFilled) {
      setAutoFilled(false);
      setPerenualId(null);
      setCareInfo(null);
    }
  }

  async function handleSave() {
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
      const now = Date.now();
      const plantId = await insertPlant(db, {
        name: trimmedName,
        nickname: nickname.trim() || null,
        species: species.trim() || null,
        perenual_id: perenualId,
        photo_uri: photoUri,
        notes: notes.trim() || null,
        acquired_at: acquiredAtTimestamp,
        created_at: now,
      });

      let notificationId: string | null = null;
      const granted = await requestPermissions();
      if (granted) {
        notificationId = await scheduleWateringNotification(
          plantId,
          trimmedName,
          interval,
          now
        );
      }

      await upsertWateringSchedule(db, {
        plant_id: plantId,
        interval_days: interval,
        last_watered_at: now,
        notification_id: notificationId,
      });

      if (careInfo !== null) {
        await insertPlantCareInfo(db, {
          plant_id: plantId,
          sunlight: careInfo.sunlight,
          poisonous_to_pets: careInfo.poisonous_to_pets !== null
            ? (careInfo.poisonous_to_pets ? 1 : 0)
            : null,
          care_tips: notes.trim() || null,
          care_tips_fr: careInfo.notes_fr,
          care_tips_ko: careInfo.notes_ko,
        });
      }

      onSaved();
    } catch {
      Alert.alert(t('addPlant.errors.saveError'), t('addPlant.errors.saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  }

  function inputStyle(field: string) {
    return [
      styles.input,
      focusedField === field && styles.inputFocused,
      autoFilled && ['name', 'species', 'interval'].includes(field) && styles.inputAutoFilled,
    ];
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
          contentContainerStyle={[styles.scroll, { paddingTop: spacing.lg + topInset }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title + Search row */}
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>{t('addPlant.title')}</Text>
            <Button
              variant="outline"
              size="sm"
              label={t('addPlant.searchDatabase')}
              onPress={() => setSearchModalVisible(true)}
            />
          </View>

          {autoFilled && (
            <View style={styles.autoFilledBadge}>
              <Text style={styles.autoFilledText}>{t('addPlant.autoFilled')}</Text>
            </View>
          )}

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
            onChangeText={handleNameChange}
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

          {/* Care Summary (when auto-filled) */}
          {careInfo && (
            <View style={styles.careSummary}>
              <Text style={styles.careSummaryTitle}>{t('addPlant.careSummary')}</Text>
              {careInfo.sunlight ? (
                <View style={styles.careRow}>
                  <Text style={styles.careLabel}>{t('addPlant.careLight')}</Text>
                  <Text style={styles.careValue}>
                    {i18n.language === 'ko'
                      ? (careInfo.sunlight_ko ?? careInfo.sunlight)
                      : i18n.language === 'fr'
                        ? (careInfo.sunlight_fr ?? careInfo.sunlight)
                        : careInfo.sunlight}
                  </Text>
                </View>
              ) : null}
              {careInfo.poisonous_to_pets !== null ? (
                <>
                  <View style={styles.careDivider} />
                  <View style={styles.careRow}>
                    <Text style={styles.careLabel}>{t('plantDetail.poisonousForPets')}</Text>
                    <Text style={styles.careValue}>
                      {careInfo.poisonous_to_pets ? t('common.yes') : t('common.no')}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              size="lg"
              label={t('common.cancel')}
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              variant="green"
              size="lg"
              label={saving ? t('addPlant.saving') : t('addPlant.savePlant')}
              onPress={handleSave}
              disabled={!name.trim() || saving}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PlantSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelect={handleSearchSelect}
      />
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
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 672,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flexShrink: 1,
  },
  autoFilledBadge: {
    backgroundColor: colors.greenLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  autoFilledText: {
    color: colors.green,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
  inputAutoFilled: {
    backgroundColor: colors.greenLight,
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
  careSummary: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  careSummaryTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.green,
    marginBottom: spacing.sm,
  },
  careRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  careDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  careLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  careValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
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
