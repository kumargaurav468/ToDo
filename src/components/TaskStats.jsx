import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="glass-panel stats-container">
      <div className="stats-grid">
        <div className="progress-hero">
          <div className="progress-labels">
            <span className="progress-title">Overall Progress</span>
            <span className="progress-percentage">{percentage}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
            <Layers size={18} />
            <span className="stat-number">{total}</span>
          </div>
          <span className="stat-label">Total Tasks</span>
        </div>

        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)' }}>
            <CheckCircle2 size={18} />
            <span className="stat-number">{completed}</span>
          </div>
          <span className="stat-label">Completed</span>
        </div>

        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: overdue > 0 ? 'var(--danger-color)' : 'var(--warning-color)' }}>
            {overdue > 0 ? <AlertTriangle size={18} /> : <Clock size={18} />}
            <span className="stat-number">{overdue > 0 ? `${overdue} Overdue` : pending}</span>
          </div>
          <span className="stat-label">{overdue > 0 ? 'Action Needed' : 'Pending'}</span>
        </div>
      </div>
    </section>
  );
};
