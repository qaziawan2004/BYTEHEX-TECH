import React from 'react';

const Progress = ({ current, total, progress }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
        {current} / {total}
      </span>
      <div className="progress-bar flex-1">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default Progress;