import React from 'react';
import { Zap, TrendingUp, Flame } from 'lucide-react';

const DifficultyFilter = ({ 
  selectedDifficulty, 
  setSelectedDifficulty, 
  showFilters,
  categoryQuestions,
  selectedCategory,
  onBackToTopics
}) => {
  const difficulties = [
    { 
      name: 'Easy', 
      icon: Zap, 
      color: 'emerald',
      description: 'Easy',
      count: categoryQuestions.filter(q => q.difficulty === 'Easy').length
    },
    { 
      name: 'Medium', 
      icon: TrendingUp, 
      color: 'amber',
      description: 'Medium',
      count: categoryQuestions.filter(q => q.difficulty === 'Medium').length
    },
    { 
      name: 'Hard', 
      icon: Flame, 
      color: 'rose',
      description: 'Hard',
      count: categoryQuestions.filter(q => q.difficulty === 'Hard').length
    },
  ];

  if (!showFilters) return null;

  const getColorClasses = (color, isActive) => {
    const colors = {
      emerald: {
        active: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30',
        inactive: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500'
      },
      amber: {
        active: 'bg-amber-500 border-amber-500 text-white shadow-amber-500/30',
        inactive: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500'
      },
      rose: {
        active: 'bg-rose-500 border-rose-500 text-white shadow-rose-500/30',
        inactive: 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500'
      }
    };
    return isActive ? colors[color].active : colors[color].inactive;
  };

  const totalAvailable = difficulties.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Select Level for <span className="text-purple-400 font-semibold">{selectedCategory}</span>
        </h3>
        <button
          onClick={onBackToTopics}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          ← Change Topic
        </button>
      </div>
      <div className="w-full text-xs text-gray-500 dark:text-gray-400 mb-2">
        Questions will shuffle when you start the quiz
      </div>
      {difficulties.map(({ name, icon: Icon, color, description, count }) => {
        const isActive = selectedDifficulty === name;
        const isDisabled = count === 0;
        
        return (
          <button
            key={name}
            onClick={() => !isDisabled && setSelectedDifficulty(name)}
            disabled={isDisabled}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
              isDisabled 
                ? 'opacity-40 cursor-not-allowed border-gray-600 text-gray-500'
                : getColorClasses(color, isActive)
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
            <span className="difficulty-filter-text">{description}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {count}
            </span>
            {isActive && (
              <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        );
      })}
      <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        {totalAvailable} questions available • Shuffled on start
      </div>
    </div>
  );
};

export default DifficultyFilter;