import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Paper, Typography, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';

import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskControls } from './components/TaskControls';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { getAppTheme } from './theme/theme';
import {
  loadCurrentUserFromStorage,
  saveCurrentUserToStorage,
  loadUserTasks,
  saveUserTasks,
  loadThemeFromStorage,
  saveThemeToStorage
} from './utils/storage';

export function App() {
  const [user, setUser] = useState(() => loadCurrentUserFromStorage());
  const [tasks, setTasks] = useState(() => (user ? loadUserTasks(user.id) : []));
  const [themeMode, setThemeMode] = useState(() => loadThemeFromStorage());

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerTask, setTimerTask] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  // Generate dynamic MUI Theme object
  const muiTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    saveThemeToStorage(themeMode);
  }, [themeMode]);

  useEffect(() => {
    saveCurrentUserToStorage(user);
    if (user) {
      setTasks(loadUserTasks(user.id));
    } else {
      setTasks([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      saveUserTasks(user.id, tasks);
    }
  }, [tasks, user]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
  };

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    setUser(null);
    saveCurrentUserToStorage(null);
    setIsAuthModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setTasks((prevTasks) => {
      const exists = prevTasks.some((t) => t.id === taskData.id);
      if (exists) {
        return prevTasks.map((t) => (t.id === taskData.id ? taskData : t));
      } else {
        return [taskData, ...prevTasks];
      }
    });
  };

  const handleToggleComplete = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleToggleStar = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, starred: !t.starred } : t))
    );
  };

  const handleDeleteTaskRequest = (taskId) => {
    setTaskToDeleteId(taskId);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDeleteId) {
      setTasks((prev) => prev.filter((t) => t.id !== taskToDeleteId));
      setTaskToDeleteId(null);
    }
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  const handleStartTimerForTask = (task) => {
    setTimerTask(task);
    setIsTimerOpen(true);
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `taskflow-backup-${user?.name || 'user'}-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          setTasks(importedTasks);
          alert('Tasks imported successfully!');
        } else {
          alert('Invalid file format: JSON must be an array of tasks.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const categories = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (activeTab === 'active' && t.completed) return false;
        if (activeTab === 'completed' && !t.completed) return false;
        if (activeTab === 'starred' && !t.starred) return false;

        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchSubtask = t.subtasks?.some((s) => s.title.toLowerCase().includes(q));
          if (!matchTitle && !matchNotes && !matchSubtask) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'created_asc') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'created_desc') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
        }
        return 0;
      });
  }, [tasks, activeTab, selectedCategory, searchQuery, sortBy]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          position: 'relative',
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="md">
          <Header
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogoutClick}
            theme={themeMode}
            onToggleTheme={handleToggleTheme}
            onOpenNewTaskModal={() => {
              if (!user) {
                setIsAuthModalOpen(true);
                return;
              }
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenTimer={() => {
              setTimerTask(null);
              setIsTimerOpen(true);
            }}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />

          <TaskStats tasks={tasks} />

          <TaskControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
          />

          {filteredTasks.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onToggleStar={handleToggleStar}
                  onEditTask={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTaskRequest}
                  onToggleSubtask={handleToggleSubtask}
                  onStartTimerForTask={handleStartTimerForTask}
                />
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {!user ? 'Sign in to access your tasks' : 'No tasks found'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
                {!user
                  ? 'Create an account or sign in to manage your tasks, set due dates, and track your productivity.'
                  : searchQuery
                  ? `No tasks match your search "${searchQuery}".`
                  : activeTab === 'completed'
                  ? "You haven't completed any tasks yet."
                  : activeTab === 'starred'
                  ? 'No starred tasks found.'
                  : 'Your task list is empty. Click "New Task" to create one!'}
              </Typography>
              {!user ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsAuthModalOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Sign In / Register
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Create Task
                </Button>
              )}
            </Paper>
          )}
        </Container>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
        />

        <FocusTimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          task={timerTask}
          onCompleteTask={handleToggleComplete}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <ConfirmModal
          isOpen={isLogoutConfirmOpen}
          title="Confirm Log Out"
          message={`Are you sure you want to log out of ${user?.name || 'your account'}?`}
          confirmText="Log Out"
          cancelText="Stay Logged In"
          variant="danger"
          onConfirm={handleConfirmLogout}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />

        <ConfirmModal
          isOpen={Boolean(taskToDeleteId)}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete Task"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDeleteTask}
          onCancel={() => setTaskToDeleteId(null)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
