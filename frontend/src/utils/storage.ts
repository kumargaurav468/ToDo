import {
  apiGetSession,
  apiSaveSession,
  apiDeleteSession,
  apiUpdateTheme
} from '../services/api';

export const initialSampleTasks: any[] = [];

/**
 * SQL-backed session management (No localStorage used!)
 */
export const loadCurrentUserFromStorage = async () => {
  try {
    const session = await apiGetSession();
    return session.user || null;
  } catch (error) {
    console.error('Failed to load session from SQL database:', error);
    return null;
  }
};

export const saveCurrentUserToStorage = async (user: any) => {
  try {
    if (user && user.id) {
      await apiSaveSession(user.id);
    } else {
      await apiDeleteSession();
    }
  } catch (error) {
    console.error('Failed to save session to SQL database:', error);
  }
};

/**
 * SQL-backed theme management (No localStorage used!)
 */
export const loadThemeFromStorage = async () => {
  try {
    const session = await apiGetSession();
    return session.theme || 'dark';
  } catch (error) {
    return 'dark';
  }
};

export const saveThemeToStorage = async (theme: string, userId: string | null = null) => {
  try {
    await apiUpdateTheme(userId, theme);
  } catch (error) {
    console.error('Failed to save theme to SQL database:', error);
  }
};
