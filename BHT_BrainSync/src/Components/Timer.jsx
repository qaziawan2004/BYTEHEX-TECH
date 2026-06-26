import React from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ timeLeft }) => {
  const getStatus = () => {
    if (timeLeft <= 5) return 'danger';
    if (timeLeft <= 10) return 'warning';
    return '';
  };

  const getPercentage = () => {
    return (timeLeft / 30) * 100;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="3"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#8b5cf6'}
            strokeWidth="3"
            strokeDasharray={`${getPercentage() * 1.256} 125.6`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className={`timer-ring ${getStatus()} absolute inset-0 flex items-center justify-center bg-transparent border-0`}>
          <span className="text-sm font-bold">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;