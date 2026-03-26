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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useDatabase } from '../../src/db/provider';
import { insertPlant, upsertWateringSchedule } from '../../src/db/queries';
import {
  requestPermissions,
  scheduleWateringNotification,
} from '../../src/notifications/scheduler';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/ui/theme';

export default function AddPlantScreen() {
  const db = useDatabase();
  const router = useRouter();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState('7');
  const [saving, setSaving] = useState(false);

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
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a name for your plant.');
      return;
    }

    const interval = parseInt(intervalDays, 10);
    if (isNaN(interval) || interval < 1) {
      Alert.alert('Invalid interval', 'Watering interval must be at least 1 day.');
      return;
    }

    setSaving(true);
    try {
      const now = Date.now();
      const plantId = await insertPlant(db, {
        name: trimmedName,
        species: species.trim() || null,
        perenual_id: null,
        photo_uri: photoUri,
        notes: notes.trim() || null,
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

      router.navigate('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save plant. Please try again.');
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
        <Pressable style={styles.photoButton} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderEmoji}>📷</Text>
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. My Monstera"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Species</Text>
        <TextInput
          style={styles.input}
          value={species}
          onChangeText={setSpecies}
          placeholder="e.g. Monstera deliciosa"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Watering Interval (days)</Text>
        <TextInput
          style={styles.input}
          value={intervalDays}
          onChangeText={setIntervalDays}
          keyboardType="number-pad"
          placeholder="7"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this plant..."
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
            {saving ? 'Saving...' : 'Save Plant'}
          </Text>
        </Pressable>
      </ScrollView>
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
