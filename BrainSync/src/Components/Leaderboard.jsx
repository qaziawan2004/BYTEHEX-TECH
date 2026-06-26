// src/components/Leaderboard.jsx
import React, { useState } from 'react';
import { Trophy, Medal, Clock, RefreshCw, X, Crown, Star, Award, TrendingUp } from 'lucide-react';

const Leaderboard = ({ leaderboard, onClose, onClear }) => {
  const [showAll, setShowAll] = useState(false);

  // Get medal color based on rank
  const getRankColor = (index) => {
    if (index === 0) return 'from-amber-400 to-amber-600 border-amber-400/30';
    if (index === 1) return 'from-gray-400 to-gray-600 border-gray-400/30';
    if (index === 2) return 'from-orange-400 to-orange-600 border-orange-400/30';
    return 'from-purple-500/20 to-pink-500/20 border-purple-500/10';
  };

  // Get rank icon
  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
  };

  // Get background color based on percentage
  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Get progress bar color
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-400';
    if (percentage >= 70) return 'bg-blue-400';
    if (percentage >= 50) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  if (leaderboard.length === 0) {
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
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center mb-4 border-2 border-amber-500/20">
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Scores Yet</h3>
          <p className="text-gray-400">Complete a quiz to appear on the leaderboard!</p>
          <button 
            onClick={onClose} 
            className="mt-6 btn-primary flex items-center gap-2 mx-auto px-6 py-3"
          >
            <TrendingUp className="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const displayData = showAll ? leaderboard : leaderboard.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Bigger Container - max-w-2xl instead of max-w-lg */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up border border-gray-200/50 dark:border-gray-700/50">
        {/* Header with Gradient */}
        <div className="relative p-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-b border-gray-200 dark:border-gray-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Top performers</p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Players</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{leaderboard.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top Score</p>
              <p className="text-lg font-bold text-emerald-400">{leaderboard[0]?.percentage || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-lg font-bold text-blue-400">
                {Math.round(leaderboard.reduce((acc, curr) => acc + curr.percentage, 0) / leaderboard.length)}%
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard List - Padding 8 (p-8) */}
        <div className="p-8 overflow-y-auto max-h-[50vh]">
          <div className="space-y-3">
            {displayData.map((entry, index) => {
              const isTop3 = index < 3;
              const rankColor = getRankColor(index);
              const scoreColor = getScoreColor(entry.percentage);
              const progressColor = getProgressColor(entry.percentage);
              
              return (
                <div
                  key={entry.id || index}
                  className={`relative p-4 rounded-xl transition-all duration-300 ${
                    isTop3 
                      ? `bg-gradient-to-r ${rankColor} border`
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-2 -left-2">
                    {isTop3 ? (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center shadow-lg`}>
                        {getRankIcon(index)}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">#{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${scoreColor}`}>
                          {entry.percentage}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({entry.score}/{entry.total})
                        </span>
                      </div>
                      {isTop3 && (
                        <div className="flex items-center gap-1">
                          {index === 0 && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                          {index === 1 && <Star className="w-4 h-4 text-gray-400 fill-gray-400" />}
                          {index === 2 && <Star className="w-4 h-4 text-orange-400 fill-orange-400" />}
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${progressColor} transition-all duration-1000`}
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
                        <Clock className="w-3 h-3" />
                        {entry.date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
          {leaderboard.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              {showAll ? 'Show Less' : `Show All (${leaderboard.length})`}
              <span className="text-xs">↓</span>
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Clear all leaderboard scores?')) {
                onClear();
              }
            }}
            className="text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;