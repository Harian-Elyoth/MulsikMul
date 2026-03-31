import { useState } from 'react';
import {
  Alert,
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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useDatabase } from '../../src/db/provider';
import { insertPlant, insertPlantCareInfo, upsertWateringSchedule } from '../../src/db/queries';
import {
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';
import PlantSearchModal, { PlantSearchResult } from '../../src/ui/PlantSearchModal';
import { AppLogo } from '../../src/ui/AppLogo';

function parseDateDDMMYYYY(value: string): number | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(date.getTime())) return null;
  return date.getTime();
}

export default function AddPlantScreen() {
  const db = useDatabase();
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState('7');
  const [saving, setSaving] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [perenualId, setPerenualId] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [acquiredAt, setAcquiredAt] = useState('');
  const [careInfo, setCareInfo] = useState<{ sunlight: string | null; poisonous_to_pets: boolean | null; notes_fr: string | null; notes_ko: string | null } | null>(null);

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
    setNotes(data.notes);
    setPerenualId(data.perenualId);
    setAutoFilled(true);
    setCareInfo({ sunlight: data.sunlight, poisonous_to_pets: data.poisonous_to_pets, notes_fr: data.notes_fr, notes_ko: data.notes_ko });

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

      router.navigate('/(tabs)');
    } catch (error) {
      Alert.alert(t('addPlant.errors.saveError'), t('addPlant.errors.saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppLogo size="lg" layout="vertical" />

        <Pressable
          style={styles.searchButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Text style={styles.searchButtonIcon}>🔍</Text>
          <Text style={styles.searchButtonText}>{t('addPlant.searchDatabase')}</Text>
        </Pressable>

        {autoFilled && (
          <View style={styles.autoFilledBadge}>
            <Text style={styles.autoFilledText}>{t('addPlant.autoFilled')}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Pressable style={styles.photoButton} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderEmoji}>📷</Text>
              <Text style={styles.photoPlaceholderText}>{t('addPlant.addPhoto')}</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.sectionHeader}>{t('addPlant.plantInfo')}</Text>

        <Text style={styles.label}>{t('addPlant.nameLabel')}</Text>
        <TextInput
          style={[styles.input, autoFilled && styles.inputAutoFilled]}
          value={name}
          onChangeText={handleNameChange}
          placeholder={t('addPlant.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{t('addPlant.speciesLabel')}</Text>
        <TextInput
          style={[styles.input, autoFilled && styles.inputAutoFilled]}
          value={species}
          onChangeText={setSpecies}
          placeholder={t('addPlant.speciesPh')}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{t('addPlant.acquisitionDate')}</Text>
        <TextInput
          style={styles.input}
          value={acquiredAt}
          onChangeText={setAcquiredAt}
          placeholder={t('addPlant.datePlaceholder')}
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.sectionHeader}>{t('addPlant.careSchedule')}</Text>

        <Text style={styles.label}>{t('addPlant.wateringInterval')}</Text>
        <TextInput
          style={[styles.input, autoFilled && styles.inputAutoFilled]}
          value={intervalDays}
          onChangeText={setIntervalDays}
          keyboardType="number-pad"
          placeholder="7"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{t('common.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput, autoFilled && styles.inputAutoFilled]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('addPlant.notesPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? t('addPlant.saving') : t('addPlant.savePlant')}
          </Text>
        </Pressable>
      </ScrollView>

      <PlantSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelect={handleSearchSelect}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  searchButtonIcon: {
    fontSize: fontSize.md,
  },
  searchButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  autoFilledBadge: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  autoFilledText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  photoPlaceholderText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputAutoFilled: {
    backgroundColor: colors.successLight,
    borderColor: colors.accent,
  },
  notesInput: {
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
