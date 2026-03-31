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
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textLight,
  },
  label: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
