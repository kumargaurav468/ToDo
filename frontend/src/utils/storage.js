const USERS_STORAGE_KEY = 'taskflow_users_v1';
const CURRENT_USER_KEY = 'taskflow_current_user_v1';
const THEME_STORAGE_KEY = 'taskflow_theme_v1';

export const initialSampleTasks = [];

// Current Session
export const loadCurrentUserFromStorage = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveCurrentUserToStorage = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Failed to save current user:', error);
  }
};

// Theme
export const loadThemeFromStorage = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  } catch {
    return 'dark';
  }
};

export const saveThemeToStorage = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};
