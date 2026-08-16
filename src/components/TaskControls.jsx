import React from 'react';
import { Search, Star, Filter, ArrowUpDown } from 'lucide-react';

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
}) => {
  return (
    <section className="glass-panel controls-panel">
      <div className="search-row">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title, notes, or subtasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-row">
        <div className="tab-group">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            All
          </button>
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => onTabChange('active')}
          >
            Active
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => onTabChange('completed')}
          >
            Completed
          </button>
          <button
            className={`tab-btn ${activeTab === 'starred' ? 'active' : ''}`}
            onClick={() => onTabChange('starred')}
          >
            <Star size={14} fill={activeTab === 'starred' ? '#f59e0b' : 'none'} color={activeTab === 'starred' ? '#f59e0b' : 'currentColor'} />
            Starred
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="select-dropdown"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="select-dropdown"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
