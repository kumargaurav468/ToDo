import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Box,
  Typography,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const TaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setNotes(taskToEdit.notes || '');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'Work');
      setDueDate(taskToEdit.dueDate || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setCategory('Work');
      setDueDate('');
      setSubtasks([]);
    }
    setNewSubtaskText('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub-${Date.now()}`, title: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit ? taskToEdit.id : Date.now().toString(),
      title: title.trim(),
      notes: notes.trim(),
      priority,
      category: category.trim(),
      dueDate: dueDate || null,
      subtasks,
      completed: taskToEdit ? taskToEdit.completed : false,
      starred: taskToEdit ? taskToEdit.starred : false,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString()
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          {taskToEdit ? 'Edit Task' : 'Create New Task'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Task Title *"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Notes & Details"
            placeholder="Add extra context, links, or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="high">High Priority 🔥</MenuItem>
                  <MenuItem value="medium">Medium Priority ⚡</MenuItem>
                  <MenuItem value="low">Low Priority ☕</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                placeholder="e.g. Work, Personal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Subtasks Builder */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
              SUBTASKS CHECKLIST
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add subtask item..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddSubtask} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>

            {subtasks.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {subtasks.map((st) => (
                  <Box
                    key={st.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      px: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Typography variant="body2">{st.title}</Typography>
                    <IconButton size="small" onClick={() => handleRemoveSubtask(st.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
