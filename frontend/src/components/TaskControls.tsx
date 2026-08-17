import React from 'react';
import {
  Paper,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';

export const TaskControls = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories
}: {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeTab: string;
  onTabChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  categories: string[];
}) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search tasks by title, notes, category, or subtasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <Tooltip title="Clear Search">
                  <IconButton size="small" onClick={() => onSearchChange('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => onTabChange(val)}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.5,
                px: 2,
                fontWeight: 600,
                fontSize: '0.85rem'
              }
            }}
          >
            <Tab label="All" value="all" />
            <Tab label="Active" value="active" />
            <Tab label="Completed" value="completed" />
            <Tab
              label="Starred"
              value="starred"
              icon={<StarIcon sx={{ fontSize: 16, color: activeTab === 'starred' ? '#f59e0b' : 'inherit' }} />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="created_desc">Newest First</MenuItem>
                <MenuItem value="created_asc">Oldest First</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
