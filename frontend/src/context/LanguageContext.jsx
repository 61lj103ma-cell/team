import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, availableLanguages } from '../locales';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('flowpilot_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('flowpilot_lang', langCode);
    }
  };

  const currentLanguageInfo = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  /**
   * Helper translation function: t('nav.dashboard')
   */
  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let enCurrent = translations['en'];
        for (const enKey of keys) {
          if (enCurrent && enCurrent[enKey] !== undefined) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || path;
          }
        }
        return enCurrent;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLang: language,
        setLanguage,
        t,
        availableLanguages,
        languages: availableLanguages,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
