const USERS_STORAGE_KEY = 'taskflow_users_v1';
const CURRENT_USER_KEY = 'taskflow_current_user_v1';
const THEME_STORAGE_KEY = 'taskflow_theme_v1';

export const initialSampleTasks = [];

export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Alex Morgan',
  email: 'demo@taskflow.io',
  password: 'password123'
};

// Users database
export const loadUsersFromStorage = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      const initialUsers = [DEMO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(data);
  } catch {
    return [DEMO_USER];
  }
};

export const registerUser = ({ name, email, password }) => {
  const users = loadUsersFromStorage();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Seed sample tasks for new user
  saveUserTasks(newUser.id, initialSampleTasks);

  return newUser;
};

export const loginUser = (email, password) => {
  const users = loadUsersFromStorage();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    throw new Error('Invalid email or password.');
  }
  return user;
};

// Current Session
export const loadCurrentUserFromStorage = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : DEMO_USER; // Default logged in as demo user
  } catch {
    return DEMO_USER;
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

// User Tasks storage
export const loadUserTasks = (userId) => {
  if (!userId) return [];
  const key = `taskflow_tasks_${userId}`;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialSampleTasks));
      return initialSampleTasks;
    }
    return JSON.parse(data);
  } catch {
    return initialSampleTasks;
  }
};

export const saveUserTasks = (userId, tasks) => {
  if (!userId) return;
  const key = `taskflow_tasks_${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (error) {
    console.error(`Failed to save tasks for user ${userId}:`, error);
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
