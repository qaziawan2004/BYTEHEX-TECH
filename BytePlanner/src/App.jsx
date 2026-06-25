// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTasks, getStats, generateId } from './utils/taskUtils';
import AddTask from './components/AddTask';
import SearchFilter from './components/SearchFilter';
import Statistics from './components/Statistics';
import TaskList from './components/TaskList';
import ThemeToggle from './components/ThemeToggle';
import './index.css';
import './App.css';

const App = () => {
  // State
  const [tasks, setTasks] = useLocalStorage('byteplanner_tasks', []);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', due: '', priority: 'Medium' });

  // Theme
  useEffect(() => {
    const theme = localStorage.getItem('byteplanner_theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('byteplanner_theme', next ? 'dark' : 'light');
  };

  // Task CRUD
  const addTask = (newTask) => {
    const task = {
      id: generateId(),
      ...newTask,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([task, ...tasks]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      due: task.due || '',
      priority: task.priority || 'Medium',
    });
  };

  const saveEdit = () => {
    if (!editData.title.trim()) return;
    setTasks(tasks.map(t =>
      t.id === editingId 
        ? { ...t, title: editData.title.trim(), due: editData.due, priority: editData.priority }
        : t
    ));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  // Drag & Drop - SIMPLIFIED VERSION
  const [draggedItemId, setDraggedItemId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // For visual feedback
    setTimeout(() => {
      const el = document.querySelector(`[data-task-id="${id}"]`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (!draggedId || draggedId === targetId) {
      setDraggedItemId(null);
      return;
    }

    // Find indices
    const draggedIndex = tasks.findIndex(t => t.id === draggedId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      return;
    }

    // Reorder
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    
    setTasks(newTasks);
    setDraggedItemId(null);
    
    // Remove dragging class
    document.querySelectorAll('.task-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    document.querySelectorAll('.task-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  // Computed
  const filteredTasks = filterTasks(tasks, filter, searchQuery);
  const stats = getStats(tasks);

  return (
    <div>
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">
          <span className="brand">TaskFlow</span>
          <span className="subtitle">Advanced To-Do Management System</span>
        </h1>
        <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
      </div>

      {/* Statistics */}
      <Statistics stats={stats} />

      {/* Add Task */}
      <div className="card">
        <AddTask onAddTask={addTask} />
      </div>

      {/* Search & Filter */}
      <div className="card">
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {/* Task List */}
      <div className="card">
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
          onEdit={startEdit}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          editingId={editingId}
          editData={editData}
          setEditData={setEditData}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          draggedItemId={draggedItemId}
        />
      </div>
    </div>
  );
};

export default App;