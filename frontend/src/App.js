import React from 'react';
import { ThemeProvider, useTheme } from './themes/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ThemeSwitcher from './themes/ThemeSwitcher';
import ToastContainer from './components/Toast';
import './themes/ThemeSwitcher.css';
import ModernApp from './themes/ModernApp';
import ClassicApp from './themes/classic/ClassicApp';

function AppContent() {
  const { currentTheme } = useTheme();

  // Render the appropriate app based on current theme
  if (currentTheme === 'classic') {
    return <ClassicApp />;
  }

  return <ModernApp />;
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ThemeSwitcher />
        <AppContent />
        <ToastContainer />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
