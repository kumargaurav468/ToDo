import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

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
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub-${Date.now()}`, title: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Details</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add extra context, links, or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High Priority 🔥</option>
                <option value="medium">Medium Priority ⚡</option>
                <option value="low">Low Priority ☕</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Work, Personal, Fitness"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Subtasks Builder */}
          <div className="form-group">
            <label className="form-label">Subtasks Checklist</label>
            <div className="subtask-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add subtask item..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddSubtask}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="subtask-list-builder">
                {subtasks.map((st) => (
                  <div key={st.id} className="subtask-builder-item">
                    <span>{st.title}</span>
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => handleRemoveSubtask(st.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
