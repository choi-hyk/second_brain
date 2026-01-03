import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { supportedLanguages, type Language } from './i18n';
import { LoadingPage } from './pages/LoadingPage';
import router from './routes';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<Language>(() =>
        supportedLanguages.includes(i18n.language as Language) ? (i18n.language as Language) : 'en',
    );
    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem('lang', language);
        if (i18n.language !== language) {
            void i18n.changeLanguage(language);
        }
    }, [i18n, language]);

    useEffect(() => {
        const handleLanguageChange = (lng: string) => {
            if (supportedLanguages.includes(lng as Language)) {
                setLanguage(lng as Language);
            }
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <ThemeProvider>
                <Suspense fallback={<LoadingPage />}>
                    <RouterProvider router={router} />
                </Suspense>
            </ThemeProvider>
        </div>
    );
}

export default App;
