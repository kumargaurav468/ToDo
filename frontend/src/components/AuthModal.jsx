import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { apiLogin, apiRegister } from '../services/api';
import { DEMO_USER } from '../utils/storage';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please fill in all fields.');
          setLoading(false);
          return;
        }
        const user = await apiRegister(name.trim(), email.trim(), password);
        onAuthSuccess(user);
      } else {
        if (!email.trim() || !password) {
          setError('Please enter your email and password.');
          setLoading(false);
          return;
        }
        const user = await apiLogin(email.trim(), password);
        onAuthSuccess(user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await apiLogin(DEMO_USER.email, DEMO_USER.password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      // Fallback if demo user needs auto-register
      try {
        const user = await apiRegister(DEMO_USER.name, DEMO_USER.email, DEMO_USER.password);
        onAuthSuccess(user);
        onClose();
      } catch (regErr) {
        setError(regErr.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {isSignUp ? <PersonAddIcon /> : <LoginIcon />}
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 2.5, pt: 1 }}>
        <Tabs
          value={isSignUp ? 1 : 0}
          onChange={(e, val) => {
            setIsSignUp(val === 1);
            setError('');
          }}
          variant="fullWidth"
        >
          <Tab label="Sign In" />
          <Tab label="Create Account" />
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {isSignUp && (
            <TextField
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
          )}

          <TextField
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />

          <TextField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : isSignUp ? <PersonAddIcon /> : <LoginIcon />}
            fullWidth
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {isSignUp ? 'Create Free Account' : 'Sign In'}
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleDemoLogin}
            fullWidth
            disabled={loading}
          >
            Quick Demo Login
          </Button>
        </DialogContent>
      </form>
    </Dialog>
  );
};
