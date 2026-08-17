import express from 'express';
import cors from 'cors';
import {
  createUser,
  findUserByEmailAndPassword,
  getUserTasks,
  saveTask,
  deleteTaskFromDb,
  getAppSetting,
  setAppSetting,
  deleteAppSetting,
  updateUserThemeInDb,
  getUserById
} from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Health Check Endpoint
// ------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow SQL Backend API is active.' });
});

// ------------------------------------------------------------------
// Session & Theme Routes (Persistent SQL State)
// ------------------------------------------------------------------
app.get('/api/session', (req, res) => {
  try {
    const activeUserId = getAppSetting('active_user_id');
    const activeTheme = getAppSetting('active_theme') || 'dark';

    let user = null;
    if (activeUserId) {
      user = getUserById(activeUserId);
    }

    res.json({
      user: user ? { id: user.id, name: user.name, email: user.email, theme: user.theme || activeTheme } : null,
      theme: user?.theme || activeTheme
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/session', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    setAppSetting('active_user_id', userId);
    const user = getUserById(userId);
    if (user && user.theme) {
      setAppSetting('active_theme', user.theme);
    }

    res.json({ success: true, userId });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/session', (req, res) => {
  try {
    deleteAppSetting('active_user_id');
    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/theme', (req, res) => {
  try {
    const { userId, theme } = req.body;
    if (!theme) {
      return res.status(400).json({ error: 'theme is required' });
    }

    updateUserThemeInDb(userId, theme);
    res.json({ success: true, theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// Auth Routes
// ------------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    const newUser = createUser(name, email, password);
    setAppSetting('active_user_id', newUser.id);
    setAppSetting('active_theme', 'dark');

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = findUserByEmailAndPassword(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    setAppSetting('active_user_id', user.id);
    if (user.theme) {
      setAppSetting('active_theme', user.theme);
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        theme: user.theme || 'dark'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// Task Routes
// ------------------------------------------------------------------
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

// AI Search Endpoint
app.post('/api/ai/search', (req, res) => {
  try {
    const { userId, query } = req.body;
    if (!userId || !query) {
      return res.status(400).json({ error: 'userId and query are required.' });
    }
    const tasks = getUserTasks(userId);
    // Simple backend telemetry log
    console.log(`[AI Search] User ${userId} searched: "${query}"`);
    res.json({ status: 'success', query, totalTasksChecked: tasks.length });
  } catch (error) {
    console.error('AI Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`TaskFlow Express SQL API running on http://localhost:${PORT}`);
});
