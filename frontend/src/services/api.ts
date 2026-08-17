export const apiGetSession = async () => {
  const res = await fetch('/api/session');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch session.');
  }
  return data; // returns { user, theme }
};

export const apiSaveSession = async (userId: string) => {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save session.');
  }
  return data;
};

export const apiDeleteSession = async () => {
  const res = await fetch('/api/session', {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete session.');
  }
  return data;
};

export const apiUpdateTheme = async (userId: string | null, theme: string) => {
  const res = await fetch('/api/user/theme', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, theme })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update theme.');
  }
  return data.theme;
};

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed.');
  }
  return data.user;
};

export const apiRegister = async (name: string, email: string, password: string) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed.');
  }
  return data.user;
};

export const apiGetTasks = async (userId: string) => {
  const res = await fetch(`/api/tasks?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch tasks.');
  }
  return data.tasks;
};

export const apiSaveTask = async (userId: string, task: any) => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, task })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save task.');
  }
  return data.task;
};

export const apiDeleteTask = async (userId: string, taskId: string) => {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete task.');
  }
  return data.taskId;
};
