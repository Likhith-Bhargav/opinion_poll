/**
 * Theme Configuration System
 *
 * This configuration system allows easy switching between different UI themes.
 * Each theme defines its components, styles, and behavior.
 */

export const THEME_CONFIG = {
  modern: {
    name: 'Modern',
    description: 'Glass morphism design with gradient backgrounds',
    icon: '🌈',
    components: {
      App: 'ModernApp',
      Auth: 'Auth',
      PollList: 'PollList',
      CreatePoll: 'CreatePoll',
      PollDetail: 'PollDetail'
    },
    paths: {
      App: './themes/ModernApp',
      Auth: './components/Auth',
      PollList: './components/PollList',
      CreatePoll: './components/CreatePoll',
      PollDetail: './components/PollDetail'
    },
    styles: {
      main: './App.css',
      auth: './components/Auth.css',
      pollList: './components/PollList.css',
      createPoll: './components/CreatePoll.css',
      pollDetail: './components/PollDetail.css'
    }
  },
  classic: {
    name: 'Classic',
    description: 'Elegant dark design with creative animations',
    icon: '✨',
    components: {
      App: 'ClassicApp',
      Auth: 'Auth',
      PollList: 'PollList',
      CreatePoll: 'CreatePoll',
      PollDetail: 'PollDetail'
    },
    paths: {
      App: './themes/classic/ClassicApp',
      Auth: './themes/classic/Auth',
      PollList: './themes/classic/PollList',
      CreatePoll: './themes/classic/CreatePoll',
      PollDetail: './themes/classic/PollDetail'
    },
    styles: {
      main: './themes/classic/ClassicTheme.css',
      auth: './themes/classic/Auth.css',
      pollList: './themes/classic/PollList.css',
      createPoll: './themes/classic/CreatePoll.css',
      pollDetail: './themes/classic/PollDetail.css'
    }
  }
};

export const DEFAULT_THEME = 'modern';

/**
 * Get theme configuration by name
 */
export const getThemeConfig = (themeName) => {
  return THEME_CONFIG[themeName] || THEME_CONFIG[DEFAULT_THEME];
};

/**
 * Get all available themes
 */
export const getAvailableThemes = () => {
  return Object.keys(THEME_CONFIG).map(key => ({
    key,
    ...THEME_CONFIG[key]
  }));
};

/**
 * Check if theme exists
 */
export const themeExists = (themeName) => {
  return themeName in THEME_CONFIG;
};

/**
 * Get component path for a specific theme and component
 */
export const getComponentPath = (themeName, componentName) => {
  const theme = getThemeConfig(themeName);
  return theme.paths[componentName] || theme.paths.App;
};

/**
 * Get style path for a specific theme and component
 */
export const getStylePath = (themeName, componentName) => {
  const theme = getThemeConfig(themeName);
  return theme.styles[componentName] || theme.styles.main;
};

/**
 * Theme switching utilities
 */
export const switchTheme = (currentTheme, newTheme) => {
  if (!themeExists(newTheme)) {
    console.warn(`Theme "${newTheme}" does not exist. Available themes:`, getAvailableThemes().map(t => t.key));
    return currentTheme;
  }
  return newTheme;
};

/**
 * Save theme preference to localStorage
 */
export const saveThemePreference = (themeName) => {
  try {
    localStorage.setItem('opinion_poll_theme', themeName);
  } catch (error) {
    console.warn('Could not save theme preference:', error);
  }
};

/**
 * Load theme preference from localStorage
 */
export const loadThemePreference = () => {
  try {
    return localStorage.getItem('opinion_poll_theme') || DEFAULT_THEME;
  } catch (error) {
    console.warn('Could not load theme preference:', error);
    return DEFAULT_THEME;
  }
};
