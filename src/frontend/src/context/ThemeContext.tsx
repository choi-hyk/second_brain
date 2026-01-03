import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (next: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = 'hippobox_theme';

const getStoredTheme = (): Theme | null => {
    if (typeof window === 'undefined') return null;
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return value === 'dark' || value === 'light' ? value : null;
    } catch {
        return null;
    }
};

const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveInitialTheme = (): Theme => getStoredTheme() ?? getSystemTheme();

type ThemeProviderProps = {
    children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.classList.toggle('dark', theme === 'dark');
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // ignore storage errors
        }
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme,
            toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
        }),
        [theme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
