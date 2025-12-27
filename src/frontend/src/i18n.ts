import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';

const resources = {
    en: {
        translation: en,
    },
    ko: {
        translation: ko,
    },
} as const;

export const supportedLanguages = ['en', 'ko'] as const;
export type Language = (typeof supportedLanguages)[number];

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ko') {
        return stored;
    }

    return 'en';
};

void i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
