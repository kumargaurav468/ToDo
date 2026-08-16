import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Do you really want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <Dialog open={isOpen} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              bgcolor: isDanger ? 'error.light' : 'warning.light',
              color: isDanger ? 'error.main' : 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9
            }}
          >
            {isDanger ? <LogoutIcon /> : <WarningAmberIcon />}
          </Box>
          <Box sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</Box>
        </Box>
        <IconButton onClick={onCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        <DialogContentText color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isDanger ? 'error' : 'primary'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
