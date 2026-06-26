// src/utils/taskUtils.js
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'priority-high';
    case 'Medium': return 'priority-medium';
    case 'Low': return 'priority-low';
    default: return '';
  }
};

export const getPriorityEmoji = (priority) => {
  switch (priority) {
    case 'High': return '🔴';
    case 'Medium': return '🟡';
    case 'Low': return '🟢';
    default: return '';
  }
};

export const filterTasks = (tasks, filter, searchQuery) => {
  return tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'All' ? true :
      filter === 'Active' ? !task.completed :
      filter === 'Completed' ? task.completed : true;
    return matchesSearch && matchesFilter;
  });
};

export const getStats = (tasks) => {
  const total = tasks.length;
  const active = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  const priorityCounts = {
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length,
  };
  return { total, active, completed, priorityCounts };
};