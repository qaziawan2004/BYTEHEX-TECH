import React, { useState } from 'react';

const AddTask = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({ title: title.trim(), due, priority });
    setTitle('');
    setDue('');
    setPriority('Medium');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 min-w-[150px] input-field"
        autoFocus
      />
      <input
        type="date"
        value={due}
        onChange={(e) => setDue(e.target.value)}
        className="w-36 input-field"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-32 input-field"
      >
        <option value="High">🔴 High</option>
        <option value="Medium">🟡 Medium</option>
        <option value="Low">🟢 Low</option>
      </select>
      <button type="submit" className="btn-primary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </button>
    </form>
  );
};

export default AddTask;