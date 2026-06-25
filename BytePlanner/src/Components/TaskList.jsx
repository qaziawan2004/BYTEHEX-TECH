// src/components/TaskList.jsx
import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ 
  tasks, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  editingId,
  editData,
  setEditData,
  onSaveEdit,
  onCancelEdit
}) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <div className="empty-title">No tasks found</div>
        <div className="empty-subtitle">Add a new task to get started</div>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          isEditing={editingId === task.id}
          editData={editData}
          setEditData={setEditData}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </ul>
  );
};

export default TaskList;