import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const ThemeContext = createContext(undefined);

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.LIGHT;
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT) {
    return savedTheme;
  }
  return THEMES.LIGHT;
}

function applyThemeToDocument(theme) {
  const isDark = theme === THEMES.DARK;
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

export { THEMES };
