import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HouseplantEntry } from '../data/houseplants';
import { searchPlants } from '../api/plantSearch';
import { borderRadius, colors, fontSize, fontWeight, spacing } from './theme';
import { AppLogo } from './AppLogo';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface PlantSearchResult {
  name: string;
  species: string;
  intervalDays: number;
  notes: string;
  notes_fr: string;
  notes_ko: string;
  photoUrl: string | null;
  perenualId: number | null;
  sunlight: string | null;
  poisonous_to_pets: boolean | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (data: PlantSearchResult) => void;
}

function formatWateringLabel(intervalDays: number): string {
  if (intervalDays <= 3) return 'Frequent';
  if (intervalDays <= 10) return 'Average';
  if (intervalDays <= 21) return 'Infrequent';
  return 'Minimal';
}

export default function PlantSearchModal({ visible, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HouseplantEntry[]>([]);

  function handleQueryChange(text: string) {
    setQuery(text);
    setResults(text.trim() ? searchPlants(text.trim()) : []);
  }

  function handleSelectPlant(item: HouseplantEntry) {
    onSelect({
      name: item.common_name,
      species: item.scientific_name,
      intervalDays: item.interval_days,
      notes: item.notes,
      notes_fr: item.notes_fr,
      notes_ko: item.notes_ko,
      photoUrl: item.thumbnail,
      perenualId: null,
      sunlight: item.sunlight,
      poisonous_to_pets: item.poisonous_to_pets,
    });
    handleClose();
  }

  function handleClose() {
    setQuery('');
    setResults([]);
    onClose();
  }

  function renderItem({ item }: { item: HouseplantEntry }) {
    return (
      <Pressable style={styles.resultRow} onPress={() => handleSelectPlant(item)}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailEmoji}>🌿</Text>
          </View>
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.commonName} numberOfLines={1}>{item.common_name}</Text>
          <Text style={styles.scientificName} numberOfLines={1}>{item.scientific_name}</Text>
        </View>
        <View style={styles.wateringBadge}>
          <Text style={styles.wateringBadgeText}>{formatWateringLabel(item.interval_days)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <AppLogo size="sm" layout="horizontal" />
          <Text style={styles.headerTitle}>식물 검색</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="식물 이름을 입력하세요..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.emptyText}>"{query}"에 대한 결과가 없습니다</Text>
            ) : (
              <Text style={styles.emptyText}>식물 이름으로 검색해보세요</Text>
            )
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000044',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  commonName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scientificName: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  wateringBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wateringBadgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
