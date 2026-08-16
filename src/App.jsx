import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskControls } from './components/TaskControls';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  loadCurrentUserFromStorage,
  saveCurrentUserToStorage,
  loadUserTasks,
  saveUserTasks,
  loadThemeFromStorage,
  saveThemeToStorage
} from './utils/storage';
import { CheckCircle, Plus } from 'lucide-react';

export function App() {
  const [user, setUser] = useState(() => loadCurrentUserFromStorage());
  const [tasks, setTasks] = useState(() => (user ? loadUserTasks(user.id) : []));
  const [theme, setTheme] = useState(() => loadThemeFromStorage());

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

  // Logout Confirmation Modal state
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Delete Task Confirmation Modal state
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  // Sync theme attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveThemeToStorage(theme);
  }, [theme]);

  // Sync current user state
  useEffect(() => {
    saveCurrentUserToStorage(user);
    if (user) {
      setTasks(loadUserTasks(user.id));
    } else {
      setTasks([]);
    }
  }, [user]);

  // Sync tasks to user's local storage
  useEffect(() => {
    if (user) {
      saveUserTasks(user.id, tasks);
    }
  }, [tasks, user]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth Handlers
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

  // Task Actions
  const handleSaveTask = (taskData) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setTasks(prevTasks => {
      const exists = prevTasks.some(t => t.id === taskData.id);
      if (exists) {
        return prevTasks.map(t => (t.id === taskData.id ? taskData : t));
      } else {
        return [taskData, ...prevTasks];
      }
    });
  };

  const handleToggleComplete = (taskId) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleToggleStar = (taskId) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, starred: !t.starred } : t))
    );
  };

  const handleDeleteTaskRequest = (taskId) => {
    setTaskToDeleteId(taskId);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDeleteId) {
      setTasks(prev => prev.filter(t => t.id !== taskToDeleteId));
      setTaskToDeleteId(null);
    }
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  // Focus Timer trigger
  const handleStartTimerForTask = (task) => {
    setTimerTask(task);
    setIsTimerOpen(true);
  };

  // Export / Import
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskflow-backup-${user?.name || 'user'}-${new Date().toISOString().split('T')[0]}.json`);
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

  // Dynamic Categories List
  const categories = useMemo(() => {
    const set = new Set();
    tasks.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        // Tab Filter
        if (activeTab === 'active' && t.completed) return false;
        if (activeTab === 'completed' && !t.completed) return false;
        if (activeTab === 'starred' && !t.starred) return false;

        // Category Filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchSubtask = t.subtasks?.some(s => s.title.toLowerCase().includes(q));
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
    <div className="app-container">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <main className="main-content">
        <Header
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogoutClick}
          theme={theme}
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
          <div className="task-list">
            {filteredTasks.map(task => (
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
          </div>
        ) : (
          <div className="glass-panel empty-state">
            <div className="empty-icon">
              <CheckCircle size={32} />
            </div>
            <h3 className="empty-title">
              {!user ? 'Sign in to access your tasks' : 'No tasks found'}
            </h3>
            <p className="empty-subtitle">
              {!user
                ? 'Create an account or sign in to manage your tasks, set due dates, and track your productivity.'
                : searchQuery
                ? `No tasks match your search "${searchQuery}".`
                : activeTab === 'completed'
                ? "You haven't completed any tasks yet."
                : activeTab === 'starred'
                ? 'No starred tasks found.'
                : 'Your task list is empty. Click "New Task" to create one!'}
            </p>
            {!user ? (
              <button
                className="btn btn-primary"
                onClick={() => setIsAuthModalOpen(true)}
                style={{ marginTop: '8px' }}
              >
                Sign In / Register
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                style={{ marginTop: '8px' }}
              >
                <Plus size={16} /> Create Task
              </button>
            )}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        task={timerTask}
        onCompleteTask={handleToggleComplete}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Confirm Log Out"
        message={`Are you sure you want to log out of ${user?.name || 'your account'}? Any unsaved changes in progress will be stored in your session.`}
        confirmText="Log Out"
        cancelText="Stay Logged In"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {/* Delete Task Confirmation Dialog */}
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
    </div>
  );
}

export default App;
