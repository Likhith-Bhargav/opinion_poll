import React from 'react';
import { useTheme } from './ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { switchTheme, isClassicTheme, isModernTheme } = useTheme();
  const { showNotification } = useNotification();

  const handleThemeSwitch = (theme) => {
    switchTheme(theme);
    const themeName = theme === 'classic' ? 'Classic' : 'Modern';
    const themeIcon = theme === 'classic' ? '✨' : '🌈';
    showNotification(`${themeIcon} ${themeName} theme activated!`, 'info', 2000);
  };

  return (
    <div className="theme-switcher">
      <div className="theme-toggle">
        <span className="theme-label">UI Theme:</span>
        <button
          className={`theme-btn modern ${isModernTheme ? 'active' : ''}`}
          onClick={() => handleThemeSwitch('modern')}
          title="Modern Theme - Glass morphism design"
        >
          🌈 Modern
        </button>
        <button
          className={`theme-btn classic ${isClassicTheme ? 'active' : ''}`}
          onClick={() => handleThemeSwitch('classic')}
          title="Classic Theme - Elegant dark design"
        >
          ✨ Classic
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
