import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel serverless functions, root filesystem is read-only; use /tmp directory
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const dbDir = isVercel ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'taskflow.sqlite');

export const db = new DatabaseSync(dbPath);

// Initialize SQL Schema
export const initDatabase = () => {
  // Users Table with theme column
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      theme TEXT DEFAULT 'dark',
      created_at TEXT NOT NULL
    );
  `);

  // Migration: Add theme column to users table if missing
  try {
    db.exec(`ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark';`);
  } catch {
    // Column already exists
  }

  // App Settings Table (Stores active user session & global preferences in SQL)
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      category TEXT DEFAULT 'General',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      starred INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Subtasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);
};

// Auto-initialize DB schema
initDatabase();

// ------------------------------------------------------------------
// APP SETTINGS / SESSION LOGIC
// ------------------------------------------------------------------
export const getAppSetting = (key) => {
  const stmt = db.prepare(`SELECT value FROM app_settings WHERE key = ?`);
  const row = stmt.get(key);
  return row ? row.value : null;
};

export const setAppSetting = (key, value) => {
  const stmt = db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
};

export const deleteAppSetting = (key) => {
  const stmt = db.prepare(`DELETE FROM app_settings WHERE key = ?`);
  stmt.run(key);
};

export const updateUserThemeInDb = (userId, theme) => {
  if (userId) {
    const stmt = db.prepare(`UPDATE users SET theme = ? WHERE id = ?`);
    stmt.run(theme, userId);
  }
  setAppSetting('active_theme', theme);
};

export const getUserById = (id) => {
  const stmt = db.prepare(`SELECT id, name, email, theme FROM users WHERE id = ?`);
  return stmt.get(id);
};

// ------------------------------------------------------------------
// USER AUTHENTICATION LOGIC
// ------------------------------------------------------------------
export const createUser = (name, email, password) => {
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const id = `user-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, theme, created_at)
    VALUES (?, ?, ?, ?, 'dark', ?)
  `);
  stmt.run(id, name, email, password, createdAt);

  return { id, name, email, theme: 'dark', createdAt };
};

export const findUserByEmailAndPassword = (email, password) => {
  const stmt = db.prepare(`SELECT id, name, email, password, theme FROM users WHERE email = ?`);
  const user = stmt.get(email);
  if (!user || user.password !== password) {
    return null;
  }
  return { id: user.id, name: user.name, email: user.email, theme: user.theme || 'dark' };
};

// ------------------------------------------------------------------
// TASK OPERATIONS LOGIC
// ------------------------------------------------------------------
export const getUserTasks = (userId) => {
  const tasksStmt = db.prepare(`SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`);
  const rawTasks = tasksStmt.all(userId);

  const subtasksStmt = db.prepare(`SELECT * FROM subtasks WHERE task_id = ?`);

  return rawTasks.map((t) => {
    const subtasks = subtasksStmt.all(t.id).map((s) => ({
      id: s.id,
      title: s.title,
      completed: Boolean(s.completed)
    }));

    return {
      id: t.id,
      title: t.title,
      notes: t.notes || '',
      category: t.category || 'General',
      priority: t.priority || 'medium',
      dueDate: t.due_date || null,
      completed: Boolean(t.completed),
      starred: Boolean(t.starred),
      createdAt: t.created_at,
      subtasks
    };
  });
};

export const saveTask = (userId, task) => {
  const existing = db.prepare(`SELECT id FROM tasks WHERE id = ?`).get(task.id);
  const now = new Date().toISOString();

  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE tasks
      SET title = ?, notes = ?, category = ?, priority = ?, due_date = ?, completed = ?, starred = ?
      WHERE id = ? AND user_id = ?
    `);
    updateStmt.run(
      task.title,
      task.notes || '',
      task.category || 'General',
      task.priority || 'medium',
      task.dueDate || null,
      task.completed ? 1 : 0,
      task.starred ? 1 : 0,
      task.id,
      userId
    );
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, user_id, title, notes, category, priority, due_date, completed, starred, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      task.id,
      userId,
      task.title,
      task.notes || '',
      task.category || 'General',
      task.priority || 'medium',
      task.dueDate || null,
      task.completed ? 1 : 0,
      task.starred ? 1 : 0,
      task.createdAt || now
    );
  }

  // Handle Subtasks
  db.prepare(`DELETE FROM subtasks WHERE task_id = ?`).run(task.id);
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    const insertSubtask = db.prepare(`
      INSERT INTO subtasks (id, task_id, title, completed)
      VALUES (?, ?, ?, ?)
    `);
    for (const sub of task.subtasks) {
      insertSubtask.run(sub.id, task.id, sub.title, sub.completed ? 1 : 0);
    }
  }

  return task;
};

export const deleteTaskFromDb = (userId, taskId) => {
  const stmt = db.prepare(`DELETE FROM tasks WHERE id = ? AND user_id = ?`);
  stmt.run(taskId, userId);
};
