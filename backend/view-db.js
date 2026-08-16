import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'taskflow.sqlite');

try {
  const db = new DatabaseSync(dbPath);
  console.log('\n==========================================');
  console.log('      TASKFLOW SQL DATABASE VIEWER        ');
  console.log('==========================================\n');

  console.log('--- USERS TABLE ---');
  const users = db.prepare('SELECT id, name, email, created_at FROM users').all();
  console.table(users);

  console.log('\n--- TASKS TABLE ---');
  const tasks = db.prepare('SELECT id, user_id, title, category, priority, completed, starred FROM tasks').all();
  if (tasks.length === 0) {
    console.log('(No tasks created yet)');
  } else {
    console.table(tasks);
  }

  console.log('\n--- SUBTASKS TABLE ---');
  const subtasks = db.prepare('SELECT * FROM subtasks').all();
  if (subtasks.length === 0) {
    console.log('(No subtasks created yet)');
  } else {
    console.table(subtasks);
  }
  console.log('\n==========================================\n');
} catch (err) {
  console.error('Failed to read SQLite database:', err.message);
}
