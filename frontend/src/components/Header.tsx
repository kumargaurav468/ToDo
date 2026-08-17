import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Chip
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import TimerIcon from '@mui/icons-material/Timer';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

export const Header = ({
  user,
  onOpenAuthModal,
  onLogout,
  theme,
  onToggleTheme,
  onOpenNewTaskModal,
  onOpenTimer,
  onOpenAiAssistant,
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
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
          }}
        >
          <TaskAltIcon sx={{ fontSize: 28 }} />
        </Box>

        <Box>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              fontWeight: 800
            }}
          >
            TaskFlow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Smart Productivity & Task Workspace
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title="Voice Assistant & Hands-Free Task Control (Accessibility)">
          <Button
            variant="outlined"
            onClick={onOpenAiAssistant}
            startIcon={<RecordVoiceOverIcon sx={{ color: '#a855f7' }} />}
            sx={{
              borderRadius: 3,
              borderColor: 'rgba(168, 85, 247, 0.5)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.1) 100%)',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.2)',
              '&:hover': {
                borderColor: '#a855f7',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.2) 100%)'
              }
            }}
          >
            AI Assistant
          </Button>
        </Tooltip>

        <Tooltip title="Focus Timer (Pomodoro)">
          <IconButton onClick={onOpenTimer} color="inherit">
            <TimerIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export JSON Backup">
          <IconButton onClick={onExportData} color="inherit">
            <DownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import JSON Backup">
          <IconButton component="label" color="inherit">
            <UploadIcon />
            <input type="file" accept=".json" onChange={handleFileChange} hidden />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          <IconButton onClick={onToggleTheme} color="inherit">
            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onOpenNewTaskModal}
        >
          New Task
        </Button>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                bgcolor: 'action.hover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main'
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {user.name}
              </Typography>
            </Box>

            <Tooltip title="Log Out">
              <IconButton onClick={onLogout} color="error">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={onOpenAuthModal}
            sx={{ ml: 1 }}
          >
            Sign In
          </Button>
        )}
      </Box>
    </Paper>
  );
};
