import React from 'react';
import { Brain, Sun, Moon, Trophy, History } from 'lucide-react';

const Navbar = ({ darkMode, toggleTheme, onLeaderboardClick, onHistoryClick }) => {
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Brain<span className="text-purple-500 dark:text-purple-400">Sync</span>
            </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* History Button */}
        <button
          onClick={onHistoryClick}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-400"
          aria-label="History"
          title="Quiz History"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Leaderboard Button */}
        <button
          onClick={onLeaderboardClick}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-amber-400"
          aria-label="Leaderboard"
          title="Leaderboard"
        >
          <Trophy className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;