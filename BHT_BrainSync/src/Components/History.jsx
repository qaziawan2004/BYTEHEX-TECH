// src/components/History.jsx
import React, { useState } from 'react';
import { X, Clock, Calendar, TrendingUp, BookOpen, Award, Zap } from 'lucide-react';

const History = ({ history, onClose, onClear }) => {
  const [showAll, setShowAll] = useState(false);

  const displayData = showAll ? history : history.slice(0, 10);

  // Get color based on percentage
  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (percentage >= 70) return 'bg-blue-500/10 border-blue-500/20';
    if (percentage >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  if (history.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-fade-in-up">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500/20">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No History Yet</h3>
          <p className="text-gray-400">Complete a quiz to see your history here!</p>
          <button 
            onClick={onClose} 
            className="mt-6 btn-primary flex items-center gap-2 mx-auto px-6 py-3"
          >
            <Zap className="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Bigger Container - max-w-2xl instead of max-w-lg */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up border border-gray-200/50 dark:border-gray-700/50">
        {/* Header with Gradient */}
        <div className="relative p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-b border-gray-200 dark:border-gray-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your previous attempts</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-8 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Quizzes</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{history.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best Score</p>
              <p className="text-lg font-bold text-emerald-400">
                {Math.max(...history.map(h => h.percentage))}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-lg font-bold text-blue-400">
                {Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / history.length)}%
              </p>
            </div>
          </div>
        </div>

        {/* History List - Padding 8 (p-8) */}
        <div className="p-8 overflow-y-auto max-h-[50vh]">
          <div className="space-y-3">
            {displayData.map((entry, index) => {
              const scoreColor = getScoreColor(entry.percentage);
              const bgColor = getBgColor(entry.percentage);
              
              return (
                <div
                  key={entry.id || index}
                  className={`p-4 rounded-xl border ${bgColor} transition-all duration-300 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${scoreColor}`}>
                        {entry.percentage}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({entry.score}/{entry.total})
                      </span>
                      <div className="flex items-center gap-1">
                        <Award className={`w-4 h-4 ${scoreColor}`} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        entry.percentage >= 90 ? 'bg-emerald-400' :
                        entry.percentage >= 70 ? 'bg-blue-400' :
                        entry.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${entry.percentage}%` }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {entry.category || 'All'}
                    </span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                    <span className={`font-medium ${
                      entry.difficulty === 'Easy' ? 'text-emerald-400' :
                      entry.difficulty === 'Medium' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {entry.difficulty || 'All'}
                    </span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                    </span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
          {history.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {showAll ? 'Show Less' : `Show All (${history.length})`}
              <span className="text-xs">↓</span>
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Clear all history?')) {
                onClear();
              }
            }}
            className="text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;