import { useState, useEffect } from 'react';

export default function useDarkThemeActive() {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  useEffect(() => {
    function refreshTheme() {
      const current = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkTheme(current.matches);
      return current;
    }

    const mediaQuery = refreshTheme();
    mediaQuery.addEventListener('change', refreshTheme);
    return () => mediaQuery.removeEventListener('change', refreshTheme);
  }, []);

  return isDarkTheme;
}
