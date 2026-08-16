import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Lock, Mail, User } from 'lucide-react';
import { loginUser, registerUser, DEMO_USER } from '../utils/storage';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please fill in all fields.');
          return;
        }
        const user = registerUser({ name: name.trim(), email: email.trim(), password });
        onAuthSuccess(user);
      } else {
        if (!email.trim() || !password) {
          setError('Please enter your email and password.');
          return;
        }
        const user = loginUser(email.trim(), password);
        onAuthSuccess(user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleDemoLogin = () => {
    setError('');
    try {
      const user = loginUser(DEMO_USER.email, DEMO_USER.password);
      onAuthSuccess(user);
      onClose();
    } catch {
      onAuthSuccess(DEMO_USER);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <h2 className="modal-title">
              {isSignUp ? 'Create TaskFlow Account' : 'Welcome Back'}
            </h2>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className="tab-group" style={{ width: '100%', display: 'flex' }}>
            <button
              type="button"
              className={`tab-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Create Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ paddingTop: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-bg)',
                color: 'var(--danger-color)',
                fontSize: '0.85rem',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
          >
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>Quick Demo Login</span>
          </button>
        </form>
      </div>
    </div>
  );
};
