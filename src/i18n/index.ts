import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr';
import ko from './ko';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ko: { translation: ko },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
