// src/components/SearchFilter.jsx
import React from 'react';

const SearchFilter = ({ searchQuery, setSearchQuery, filter, setFilter }) => {
  const filters = ['All', 'Active', 'Completed'];

  return (
    <div className="search-filter-bar">
      <div className="search-wrap">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="filter-group">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;