import express from 'express';
import cors from 'cors';
import {
  initDatabase,
  getUserByEmail,
  createUser,
  getUserTasks,
  saveTask,
  deleteTaskFromDb
} from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = createUser({ name, email, password });
    res.status(201).json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task Routes
app.get('/api/tasks', (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }
    const tasks = getUserTasks(userId);
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { userId, task } = req.body;
    if (!userId || !task) {
      return res.status(400).json({ error: 'userId and task are required.' });
    }
    const saved = saveTask(userId, task);
    res.json({ task: saved });
  } catch (error) {
    console.error('Save task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.query.userId;
    if (!userId || !taskId) {
      return res.status(400).json({ error: 'userId and taskId are required.' });
    }
    deleteTaskFromDb(userId, taskId);
    res.json({ success: true, taskId });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Endpoint
app.post('/api/ai/process', (req, res) => {
  try {
    const { prompt, tasks } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }
    res.json({ status: 'success', receivedPrompt: prompt });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`TaskFlow Express SQL API running on http://localhost:${PORT}`);
});
