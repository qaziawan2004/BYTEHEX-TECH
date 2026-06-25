// src/components/TaskItem.jsx
import React, { useState } from 'react';
import { getPriorityColor, getPriorityEmoji } from '../utils/taskUtils';

const TaskItem = ({ 
  task, 
  index, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isEditing,
  editData,
  setEditData,
  onSaveEdit,
  onCancelEdit
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    onDragStart(e, index);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return '';
    }
  };

  return (
    <li
      className={`task-item ${task.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>

      <input
        type="checkbox"
        className="task-check"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
      />

      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Task title"
            autoFocus
          />
          <input
            type="date"
            value={editData.due}
            onChange={(e) => setEditData({ ...editData, due: e.target.value })}
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button onClick={onSaveEdit} className="btn-save">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button onClick={onCancelEdit} className="btn-cancel">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div className="task-content">
            <div className="task-title">{task.title}</div>
            <div className="task-meta">
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {getPriorityEmoji(task.priority)} {task.priority}
              </span>
              {task.due && (
                <span className="due-date">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {task.due}
                </span>
              )}
            </div>
          </div>
          <div className="task-actions">
            <button onClick={() => onEdit(task)} aria-label="Edit">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={() => onDelete(task.id)} className="delete-btn" aria-label="Delete">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default TaskItem;