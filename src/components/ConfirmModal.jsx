import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Do you really want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'primary' | 'warning'
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: variant === 'danger' ? 'var(--danger-bg)' : 'rgba(99, 102, 241, 0.15)',
                color: variant === 'danger' ? 'var(--danger-color)' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: variant === 'danger' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              {variant === 'danger' ? <LogOut size={20} /> : <AlertTriangle size={20} />}
            </div>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="action-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            style={{
              background: variant === 'danger' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : undefined,
              boxShadow: variant === 'danger' ? '0 4px 16px rgba(239, 68, 68, 0.3)' : undefined
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
