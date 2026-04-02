import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';
import { colors } from './theme';

export function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();

  function toggle() {
    changeLanguage(language === 'fr' ? 'ko' : 'fr');
  }

  return (
    <TouchableOpacity onPress={toggle} style={styles.button} accessibilityLabel="Change language">
      <Text style={styles.label}>{language === 'fr' ? '한국어' : 'FR'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
