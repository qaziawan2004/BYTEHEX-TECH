import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-8 bg-white/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline animate-pulse" /> by{' '}
          <span className="text-purple-500 dark:text-purple-400 font-semibold">@BrainSync</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;