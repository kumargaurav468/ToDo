import React from 'react';
import { Paper, Grid, Typography, Box, LinearProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LayersIcon from '@mui/icons-material/Layers';

export const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2.5} alignItems="center">
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Overall Progress
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <LayersIcon fontSize="small" />
                  <Typography variant="h6" fontWeight={800}>
                    {total}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOTAL TASKS
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                  <CheckCircleOutlineIcon fontSize="small" />
                  <Typography variant="h6" fontWeight={800}>
                    {completed}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  COMPLETED
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: overdue > 0 ? 'error.main' : 'warning.main'
                  }}
                >
                  {overdue > 0 ? <WarningAmberIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />}
                  <Typography variant="h6" fontWeight={800}>
                    {overdue > 0 ? `${overdue}` : pending}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {overdue > 0 ? 'OVERDUE' : 'PENDING'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
