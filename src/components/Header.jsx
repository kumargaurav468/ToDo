import React from 'react';
import { CheckSquare, Sun, Moon, Plus, Download, Upload, Timer, LogOut, LogIn, User } from 'lucide-react';

export const Header = ({
  user,
  onOpenAuthModal,
  onLogout,
  theme,
  onToggleTheme,
  onOpenNewTaskModal,
  onOpenTimer,
  onExportData,
  onImportData
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="glass-panel header-bar">
      <div className="brand-section">
        <div className="logo-badge">
          <CheckSquare size={26} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="brand-title">TaskFlow</h1>
          <p className="brand-subtitle">Smart Productivity & Task Workspace</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-icon"
          onClick={onOpenTimer}
          title="Focus Timer (Pomodoro)"
        >
          <Timer size={20} />
        </button>

        <button
          className="btn-icon"
          onClick={onExportData}
          title="Export JSON Backup"
        >
          <Download size={20} />
        </button>

        <label className="btn-icon" title="Import JSON Backup" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="btn btn-primary"
          onClick={onOpenNewTaskModal}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Task</span>
        </button>

        {/* User Account / Auth Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getInitials(user.name)}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
            </div>

            <button
              className="btn-icon"
              onClick={onLogout}
              title="Log Out"
              style={{ color: 'var(--danger-color)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={onOpenAuthModal}
            style={{ marginLeft: '4px' }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
