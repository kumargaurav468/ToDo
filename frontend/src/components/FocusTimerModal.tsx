import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import confetti from 'canvas-confetti';

export const FocusTimerModal = ({ isOpen, onClose, task, onCompleteTask }) => {
  const DEFAULT_TIME = 25 * 60;
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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          Focus Timer
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {task && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Focusing on: <strong>{task.title}</strong>
          </Typography>
        )}

        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            my: 1
          }}
        >
          {formattedTime}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleReset}>
            <RestartAltIcon />
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsRunning(!isRunning)}
            startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            sx={{ minWidth: 140 }}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>

          {task && !task.completed && (
            <Button variant="outlined" color="success" onClick={handleTaskDone}>
              <CheckCircleOutlineIcon />
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
