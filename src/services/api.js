export const apiLogin = async (email, password) => {
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

export const apiRegister = async (name, email, password) => {
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

export const apiGetTasks = async (userId) => {
  const res = await fetch(`/api/tasks?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch tasks.');
  }
  return data.tasks;
};

export const apiSaveTask = async (userId, task) => {
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

export const apiDeleteTask = async (userId, taskId) => {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete task.');
  }
  return data.taskId;
};
