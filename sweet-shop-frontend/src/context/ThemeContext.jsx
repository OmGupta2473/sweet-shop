import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // Optionally, use prefers-color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Prevent flicker: apply theme before first paint
  useEffect(() => {
    const t = getInitialTheme();
    document.documentElement.classList.add(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
