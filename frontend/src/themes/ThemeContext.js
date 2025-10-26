import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveThemePreference, loadThemePreference, DEFAULT_THEME } from './themeConfig';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);

  // Load theme preference on mount and apply CSS classes
  useEffect(() => {
    const savedTheme = loadThemePreference();
    setCurrentTheme(savedTheme);
    applyThemeClasses(savedTheme);
  }, []);

  // Apply CSS classes when theme changes
  useEffect(() => {
    applyThemeClasses(currentTheme);
  }, [currentTheme]);

  const applyThemeClasses = (theme) => {
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('modern-theme', 'classic-theme');

    // Add current theme class
    if (theme === 'classic') {
      body.classList.add('classic-theme');
    } else {
      body.classList.add('modern-theme');
    }
  };

  const switchTheme = (theme) => {
    setCurrentTheme(theme);
    saveThemePreference(theme);
    applyThemeClasses(theme);
  };

  const value = {
    currentTheme,
    switchTheme,
    isClassicTheme: currentTheme === 'classic',
    isModernTheme: currentTheme === 'modern'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
