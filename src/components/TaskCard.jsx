import React, { useState } from 'react';
import { Check, Star, Trash2, Edit2, Calendar, ChevronDown, ChevronUp, Play, Flame, Zap, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaskCard = ({
  task,
  onToggleComplete,
  onToggleStar,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onStartTimerForTask
}) => {
  const [showSubtasks, setShowSubtasks] = useState(true);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (!task.completed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#10b981']
      });
    }
    onToggleComplete(task.id);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="badge badge-priority-high">
            <Flame size={12} /> High
          </span>
        );
      case 'medium':
        return (
          <span className="badge badge-priority-medium">
            <Zap size={12} /> Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="badge badge-priority-low">
            <Coffee size={12} /> Low
          </span>
        );
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

  return (
    <div className={`glass-panel task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-main-row">
        <button
          className={`checkbox-btn ${task.completed ? 'checked' : ''}`}
          onClick={handleCheckboxClick}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check size={16} strokeWidth={3} />}
        </button>

        <div className="task-body">
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>

            <div className="card-actions">
              {!task.completed && (
                <button
                  className="action-btn"
                  onClick={() => onStartTimerForTask(task)}
                  title="Start Focus Timer"
                >
                  <Play size={16} />
                </button>
              )}
              <button
                className={`action-btn favorite ${task.starred ? 'starred' : ''}`}
                onClick={() => onToggleStar(task.id)}
                title={task.starred ? 'Unstar task' : 'Star task'}
              >
                <Star size={16} fill={task.starred ? '#f59e0b' : 'none'} />
              </button>
              <button
                className="action-btn"
                onClick={() => onEditTask(task)}
                title="Edit task"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="action-btn delete"
                onClick={() => onDeleteTask(task.id)}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.notes && <p className="task-notes">{task.notes}</p>}

          <div className="task-badges">
            {getPriorityBadge(task.priority)}

            {task.category && (
              <span className="badge badge-category">
                {task.category}
              </span>
            )}

            {task.dueDate && (
              <span className={`badge badge-due ${isOverdue ? 'overdue' : ''}`}>
                <Calendar size={12} />
                {isOverdue ? `Overdue (${task.dueDate})` : isDueToday ? 'Due Today' : task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {totalSubtasks > 0 && (
        <div className="subtasks-section">
          <div className="subtasks-header">
            <span>
              Subtasks ({completedSubtasks}/{totalSubtasks})
            </span>
            <button
              className="action-btn"
              onClick={() => setShowSubtasks(!showSubtasks)}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showSubtasks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className={`subtask-item ${sub.completed ? 'completed' : ''}`}
                >
                  <button
                    className={`mini-checkbox ${sub.completed ? 'checked' : ''}`}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                  >
                    {sub.completed && <Check size={12} strokeWidth={3} />}
                  </button>
                  <span>{sub.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
