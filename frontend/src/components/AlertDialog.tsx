import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const AlertDialog = ({
  isOpen,
  title = 'Notification',
  message,
  type = 'info',
  onClose
}) => {
  if (!isOpen) return null;

  const iconMap = {
    info: <InfoOutlinedIcon sx={{ fontSize: 32, color: 'info.main' }} />,
    error: <ErrorOutlineIcon sx={{ fontSize: 32, color: 'error.main' }} />,
    success: <CheckCircleOutlineIcon sx={{ fontSize: 32, color: 'success.main' }} />
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        {iconMap[type] || iconMap.info}
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button variant="contained" color="primary" onClick={onClose} fullWidth>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};
