import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Paper, Typography, Button, CircularProgress, Fab, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskControls } from './components/TaskControls';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AlertDialog } from './components/AlertDialog';
import { AiChatDrawer } from './components/AiChatDrawer';
import { getAppTheme } from './theme/theme';
import {
  loadCurrentUserFromStorage,
  saveCurrentUserToStorage,
  loadThemeFromStorage,
  saveThemeToStorage
} from './utils/storage';
import {
  apiGetTasks,
  apiSaveTask,
  apiDeleteTask
} from './services/api';
import { processAiPrompt } from './services/aiAssistant';

export function App() {
  const [user, setUser] = useState(() => loadCurrentUserFromStorage());
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
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
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Alert Dialog State
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title, message, type = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const muiTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    saveThemeToStorage(themeMode);
  }, [themeMode]);

  // Load User Tasks from SQL Server
  useEffect(() => {
    saveCurrentUserToStorage(user);
    if (user) {
      setLoadingTasks(true);
      apiGetTasks(user.id)
        .then((fetchedTasks) => {
          setTasks(fetchedTasks || []);
        })
        .catch((err) => {
          console.error('Failed to load tasks from SQL backend:', err);
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    } else {
      setTasks([]);
    }
  }, [user]);

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

  // Save / Update Task to SQL
  const handleSaveTask = async (taskData) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const savedTask = await apiSaveTask(user.id, taskData);
      setTasks((prevTasks) => {
        const exists = prevTasks.some((t) => t.id === savedTask.id);
        if (exists) {
          return prevTasks.map((t) => (t.id === savedTask.id ? savedTask : t));
        } else {
          return [savedTask, ...prevTasks];
        }
      });
    } catch (err) {
      showAlert('Save Error', 'Failed to save task to SQL server: ' + err.message, 'error');
    }
  };

  const handleToggleComplete = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || !user) return;

    const updated = { ...target, completed: !target.completed };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    try {
      await apiSaveTask(user.id, updated);
    } catch (err) {
      console.error('Failed to update task completion in SQL:', err);
    }
  };

  const handleToggleStar = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || !user) return;

    const updated = { ...target, starred: !target.starred };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    try {
      await apiSaveTask(user.id, updated);
    } catch (err) {
      console.error('Failed to update star in SQL:', err);
    }
  };

  const handleDeleteTaskRequest = (taskId) => {
    setTaskToDeleteId(taskId);
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDeleteId && user) {
      const idToDelete = taskToDeleteId;
      setTaskToDeleteId(null);
      setTasks((prev) => prev.filter((t) => t.id !== idToDelete));

      try {
        await apiDeleteTask(user.id, idToDelete);
      } catch (err) {
        console.error('Failed to delete task from SQL server:', err);
      }
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || !user) return;

    const updatedSubtasks = (target.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const updated = { ...target, subtasks: updatedSubtasks };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    try {
      await apiSaveTask(user.id, updated);
    } catch (err) {
      console.error('Failed to update subtask in SQL:', err);
    }
  };

  const handleStartTimerForTask = (task) => {
    setTimerTask(task);
    setIsTimerOpen(true);
  };

  // AI Assistant Action Handler
  const handleExecuteAiAction = async (promptText) => {
    if (!user) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in first to run AI automations.');
    }

    const aiResult = await processAiPrompt(promptText, tasks);

    if (aiResult.actionType === 'CREATE_TASK' && aiResult.task) {
      await handleSaveTask(aiResult.task);
    } else if (aiResult.actionType === 'ADD_SUBTASKS' && aiResult.taskId) {
      const target = tasks.find((t) => t.id === aiResult.taskId);
      if (target) {
        const mergedSubtasks = [...(target.subtasks || []), ...aiResult.subtasks];
        const updated = { ...target, subtasks: mergedSubtasks };
        await handleSaveTask(updated);
      }
    } else if (aiResult.actionType === 'COMPLETE_ALL' && aiResult.taskIds) {
      for (const id of aiResult.taskIds) {
        const target = tasks.find((t) => t.id === id);
        if (target) {
          await handleSaveTask({ ...target, completed: true });
        }
      }
    } else if (aiResult.actionType === 'DELETE_COMPLETED' && aiResult.taskIds) {
      for (const id of aiResult.taskIds) {
        await apiDeleteTask(user.id, id);
      }
      setTasks((prev) => prev.filter((t) => !aiResult.taskIds.includes(t.id)));
    }

    return aiResult;
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

  const handleImportData = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks) && user) {
          for (const t of importedTasks) {
            await apiSaveTask(user.id, t);
          }
          const updated = await apiGetTasks(user.id);
          setTasks(updated);
          showAlert('Import Successful', 'Tasks imported successfully into SQL database!', 'success');
        } else {
          showAlert('Import Failed', 'Invalid file format: JSON must be an array of tasks.', 'error');
        }
      } catch (err) {
        showAlert('Import Error', 'Failed to parse JSON file.', 'error');
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
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
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

          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : filteredTasks.length > 0 ? (
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
                  : 'Your task list is empty. Click "New Task" or ask the AI Assistant to create one!'}
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

        {/* Floating AI Assistant FAB Button */}
        <Tooltip title="AI Task Automation Assistant">
          <Fab
            color="primary"
            onClick={() => setIsAiDrawerOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)'
              }
            }}
          >
            <AutoAwesomeIcon />
          </Fab>
        </Tooltip>

        {/* Modals & Drawers */}
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

        <AlertDialog
          isOpen={alertDialog.isOpen}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onClose={closeAlert}
        />

        <AiChatDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          onExecuteAiAction={handleExecuteAiAction}
          tasks={tasks}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
