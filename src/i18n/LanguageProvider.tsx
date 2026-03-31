import React, { createContext, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from './index';

type SupportedLanguage = 'fr' | 'ko';
const LANG_FILE = FileSystem.documentDirectory + 'lang_pref.json';

interface LanguageContextValue {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('fr');

  useEffect(() => {
    FileSystem.readAsStringAsync(LANG_FILE).then((saved) => {
      if (saved === 'fr' || saved === 'ko') {
        setLanguage(saved);
        i18n.changeLanguage(saved);
      }
    }).catch(() => {
      // file doesn't exist on first run — default 'fr' is fine
    });
  }, []);

  async function changeLanguage(lang: SupportedLanguage) {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    await FileSystem.writeAsStringAsync(LANG_FILE, lang);
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
