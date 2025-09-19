import { useTheme as useThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const context = useThemeContext();
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, resolvedTheme, setTheme } = context;

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, toggle to the opposite of current system preference
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemIsDark ? 'light' : 'dark');
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
}