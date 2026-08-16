import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusTimerModal = ({ isOpen, onClose, task, onCompleteTask }) => {
  const DEFAULT_TIME = 25 * 60; // 25 minutes
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIME);
  };

  const handleTaskDone = () => {
    if (task) {
      onCompleteTask(task.id);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Focus Timer</h2>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body timer-display">
          {task && (
            <p className="timer-task-name">
              Focusing on: <strong>{task.title}</strong>
            </p>
          )}

          <div className="timer-digits">{formattedTime}</div>

          <div className="timer-controls">
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setIsRunning(!isRunning)}
              style={{ minWidth: '120px', justifyContent: 'center' }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            {task && !task.completed && (
              <button
                className="btn btn-secondary"
                onClick={handleTaskDone}
                title="Mark Task Complete & Close"
                style={{ color: 'var(--success-color)' }}
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
