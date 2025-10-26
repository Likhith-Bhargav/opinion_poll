import React from 'react';
import { ThemeProvider, useTheme } from './themes/ThemeContext';
import ModernApp from './App';
import ClassicApp from './themes/classic/ClassicApp';

const ThemeSwitcher = () => {
  const { currentTheme, switchTheme, isClassicTheme, isModernTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-toggle">
        <span className="theme-label">UI Theme:</span>
        <button
          className={`theme-btn modern ${isModernTheme ? 'active' : ''}`}
          onClick={() => switchTheme('modern')}
          title="Modern Theme"
        >
          🌈 Modern
        </button>
        <button
          className={`theme-btn classic ${isClassicTheme ? 'active' : ''}`}
          onClick={() => switchTheme('classic')}
          title="Classic Theme"
        >
          ✨ Classic
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { currentTheme } = useTheme();

  return (
    <>
      <ThemeSwitcher />
      {currentTheme === 'classic' ? <ClassicApp /> : <ModernApp />}
    </>
  );
}

export default App;
