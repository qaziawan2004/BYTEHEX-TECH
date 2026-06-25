// src/components/Statistics.jsx
import React from 'react';

const Statistics = ({ stats }) => {
  const { total, active, completed, priorityCounts } = stats;

  const statItems = [
    { label: 'Total Tasks', value: total, color: 'blue' },
    { label: 'Pending', value: active, color: 'yellow' },
    { label: 'Completed', value: completed, color: 'green' },
    { label: 'High Priority', value: priorityCounts.High, color: 'red' },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card">
          <div className="stat-label">{item.label}</div>
          <div className={`stat-value ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default Statistics;