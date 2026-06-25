// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTasks, getStats, generateId } from './utils/taskUtils';
import AddTask from './components/AddTask';
import SearchFilter from './components/SearchFilter';
import Statistics from './components/Statistics';
import TaskList from './components/TaskList';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const App = () => {
  // State
  const [tasks, setTasks] = useLocalStorage('byteplanner_tasks', []);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', due: '', priority: 'Medium' });
  const [draggedIndex, setDraggedIndex] = useState(null);

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

  // Drag & Drop - Updated to allow dragging to first position
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const filtered = filteredTasks;
    if (draggedIndex >= filtered.length || targetIndex >= filtered.length) return;

    const draggedTask = filtered[draggedIndex];
    const targetTask = filtered[targetIndex];
    
    const fullDraggedIdx = tasks.findIndex(t => t.id === draggedTask.id);
    const fullTargetIdx = tasks.findIndex(t => t.id === targetTask.id);
    
    if (fullDraggedIdx === -1 || fullTargetIdx === -1) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(fullDraggedIdx, 1);
    newTasks.splice(fullTargetIdx, 0, removed);
    setTasks(newTasks);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  // Computed
  const filteredTasks = filterTasks(tasks, filter, searchQuery);
  const stats = getStats(tasks);

  return (
    <div>
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">
          <span className="brand">HexoTask</span><br />
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
        />
      </div>
    </div>
  );
};

export default App;