import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, fontSize, fontWeight, spacing } from './theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ title, message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Plus size={40} stroke={colors.green} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {ctaLabel && onCta ? (
        <View style={styles.ctaWrapper}>
          <Button
            variant="green"
            size="lg"
            label={ctaLabel}
            icon={Plus}
            onPress={onCta}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  ctaWrapper: {
    marginTop: spacing.lg,
  },
});
