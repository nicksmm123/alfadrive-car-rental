import { useState, type ReactNode } from 'react';
import { LanguageContext, translations } from './i18n';
import type { Language } from './i18n';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}
