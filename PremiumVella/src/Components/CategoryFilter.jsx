import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  // Color mapping for categories
  const categoryColors = {
    'All': 'emerald',
    'Electronics': 'indigo',
    'Fashion': 'rose',
    'Home': 'teal',
  };

  const getColorClasses = (category) => {
    const color = categoryColors[category] || 'emerald';
    const colors = {
      emerald: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
      indigo: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      rose: 'border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20',
      teal: 'border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20',
    };
    return colors[color] || colors.emerald;
  };

  const getActiveClasses = (category) => {
    const color = categoryColors[category] || 'emerald';
    const colors = {
      emerald: 'bg-emerald-500 border-emerald-500 text-white',
      indigo: 'bg-indigo-500 border-indigo-500 text-white',
      rose: 'bg-rose-500 border-rose-500 text-white',
      teal: 'bg-teal-500 border-teal-500 text-white',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="category-filters">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`category-btn ${
            selectedCategory === category 
              ? getActiveClasses(category)
              : getColorClasses(category)
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;