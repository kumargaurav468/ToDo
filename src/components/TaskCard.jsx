import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Box,
  Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
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

  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <Chip
            size="small"
            icon={<LocalFireDepartmentIcon fontSize="small" />}
            label="High"
            color="error"
            variant="outlined"
          />
        );
      case 'medium':
        return (
          <Chip
            size="small"
            icon={<BoltIcon fontSize="small" />}
            label="Medium"
            color="warning"
            variant="outlined"
          />
        );
      case 'low':
      default:
        return (
          <Chip
            size="small"
            icon={<LocalCafeIcon fontSize="small" />}
            label="Low"
            color="success"
            variant="outlined"
          />
        );
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        opacity: task.completed ? 0.7 : 1,
        transition: 'all 0.25s ease'
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Checkbox
            checked={task.completed}
            onChange={handleCheckboxClick}
            color="success"
            sx={{ p: 0.5, mt: 0.25 }}
          />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary'
                }}
              >
                {task.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {!task.completed && (
                  <Tooltip title="Start Focus Timer">
                    <IconButton size="small" onClick={() => onStartTimerForTask(task)} color="primary">
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title={task.starred ? 'Unstar task' : 'Star task'}>
                  <IconButton size="small" onClick={() => onToggleStar(task.id)} sx={{ color: task.starred ? '#f59e0b' : 'action.active' }}>
                    {task.starred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit task">
                  <IconButton size="small" onClick={() => onEditTask(task)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete task">
                  <IconButton size="small" onClick={() => onDeleteTask(task.id)} color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {task.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, lineHeight: 1.5 }}>
                {task.notes}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {getPriorityChip(task.priority)}

              {task.category && (
                <Chip size="small" label={task.category} color="primary" variant="outlined" />
              )}

              {task.dueDate && (
                <Chip
                  size="small"
                  icon={<CalendarTodayIcon fontSize="small" />}
                  label={isOverdue ? `Overdue (${task.dueDate})` : isDueToday ? 'Due Today' : task.dueDate}
                  color={isOverdue ? 'error' : 'default'}
                  variant={isOverdue ? 'filled' : 'outlined'}
                />
              )}
            </Box>
          </Box>
        </Box>

        {totalSubtasks > 0 && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                SUBTASKS ({completedSubtasks}/{totalSubtasks})
              </Typography>
              <IconButton size="small">
                {showSubtasks ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>

            <Collapse in={showSubtasks}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                {task.subtasks.map((sub) => (
                  <Box
                    key={sub.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      opacity: sub.completed ? 0.6 : 1
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={sub.completed}
                      onChange={() => onToggleSubtask(task.id, sub.id)}
                      color="success"
                      sx={{ p: 0.25 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: sub.completed ? 'line-through' : 'none',
                        color: sub.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {sub.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
