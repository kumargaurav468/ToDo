import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'taskflow.sqlite');

export const db = new DatabaseSync(dbPath);

// Initialize SQL Schema
export const initDatabase = () => {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      category TEXT,
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

  // Seed Demo User if not exists
  const checkUserStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const demoUser = checkUserStmt.get('demo@taskflow.io');
  if (!demoUser) {
    const insertUserStmt = db.prepare(`
      INSERT INTO users (id, name, email, password, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUserStmt.run(
      'demo-user-1',
      'Alex Morgan',
      'demo@taskflow.io',
      'password123',
      new Date().toISOString()
    );
  }

  console.log('SQL Database initialized successfully at', dbPath);
};

// Database Query Helpers
export const getUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
  return stmt.get(email);
};

export const createUser = ({ name, email, password }) => {
  const id = `user-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, name, email, password, createdAt);
  return { id, name, email };
};

export const getUserTasks = (userId) => {
  const tasksStmt = db.prepare(`
    SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
  `);
  const tasks = tasksStmt.all(userId);

  const subtasksStmt = db.prepare(`
    SELECT * FROM subtasks WHERE task_id = ?
  `);

  return tasks.map((t) => {
    const rawSubtasks = subtasksStmt.all(t.id);
    return {
      id: t.id,
      title: t.title,
      notes: t.notes,
      category: t.category,
      priority: t.priority,
      dueDate: t.due_date,
      completed: Boolean(t.completed),
      starred: Boolean(t.starred),
      createdAt: t.created_at,
      subtasks: rawSubtasks.map((s) => ({
        id: s.id,
        title: s.title,
        completed: Boolean(s.completed)
      }))
    };
  });
};

export const saveTask = (userId, task) => {
  const checkStmt = db.prepare('SELECT id FROM tasks WHERE id = ?');
  const existing = checkStmt.get(task.id);

  if (existing) {
    // Update Task
    const updateStmt = db.prepare(`
      UPDATE tasks
      SET title = ?, notes = ?, category = ?, priority = ?, due_date = ?, completed = ?, starred = ?
      WHERE id = ? AND user_id = ?
    `);
    updateStmt.run(
      task.title,
      task.notes || '',
      task.category || '',
      task.priority || 'medium',
      task.dueDate || null,
      task.completed ? 1 : 0,
      task.starred ? 1 : 0,
      task.id,
      userId
    );
  } else {
    // Insert Task
    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, user_id, title, notes, category, priority, due_date, completed, starred, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      task.id,
      userId,
      task.title,
      task.notes || '',
      task.category || '',
      task.priority || 'medium',
      task.dueDate || null,
      task.completed ? 1 : 0,
      task.starred ? 1 : 0,
      task.createdAt || new Date().toISOString()
    );
  }

  // Sync Subtasks
  const deleteSubtasksStmt = db.prepare('DELETE FROM subtasks WHERE task_id = ?');
  deleteSubtasksStmt.run(task.id);

  if (task.subtasks && task.subtasks.length > 0) {
    const insertSubtaskStmt = db.prepare(`
      INSERT INTO subtasks (id, task_id, title, completed)
      VALUES (?, ?, ?, ?)
    `);
    for (const sub of task.subtasks) {
      insertSubtaskStmt.run(sub.id, task.id, sub.title, sub.completed ? 1 : 0);
    }
  }

  return task;
};

export const deleteTaskFromDb = (userId, taskId) => {
  const deleteSubtasksStmt = db.prepare('DELETE FROM subtasks WHERE task_id = ?');
  deleteSubtasksStmt.run(taskId);

  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
  deleteStmt.run(taskId, userId);
};
