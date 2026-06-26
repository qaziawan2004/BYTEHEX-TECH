import React from 'react';
import { Zap, Code, Paintbrush, Layers } from 'lucide-react';

const CategoryFilter = ({ selectedCategory, setSelectedCategory, showFilters }) => {
  const categories = [
    { name: 'All', icon: Layers, color: 'purple', description: 'All Topics' },
    { name: 'HTML', icon: Code, color: 'orange', description: 'HTML' },
    { name: 'CSS', icon: Paintbrush, color: 'blue', description: 'CSS' },
    { name: 'JavaScript', icon: Zap, color: 'yellow', description: 'JavaScript' },
  ];

  if (!showFilters) return null;

  const getColorClasses = (color, isActive) => {
    const colors = {
      purple: {
        active: 'bg-purple-500 border-purple-500 text-white shadow-purple-500/30',
        inactive: 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500'
      },
      orange: {
        active: 'bg-orange-500 border-orange-500 text-white shadow-orange-500/30',
        inactive: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500'
      },
      blue: {
        active: 'bg-blue-500 border-blue-500 text-white shadow-blue-500/30',
        inactive: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500'
      },
      yellow: {
        active: 'bg-yellow-500 border-yellow-500 text-white shadow-yellow-500/30',
        inactive: 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500'
      }
    };
    return isActive ? colors[color].active : colors[color].inactive;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="w-full mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Topic</h3>
      </div>
      {categories.map(({ name, icon: Icon, color, description }) => {
        const isActive = selectedCategory === name;
        return (
          <button
            key={name}
            onClick={() => setSelectedCategory(name)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${getColorClasses(color, isActive)}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
            <span className="category-filter-text">{description}</span>
            {isActive && (
              <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;