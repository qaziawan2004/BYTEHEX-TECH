// src/utils/helpers.js

// Fisher-Yates Shuffle Algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle questions while keeping track of original order
export const shuffleQuestions = (questions) => {
  return shuffleArray(questions).map((q, index) => ({
    ...q,
    shuffledIndex: index,
  }));
};

// Get difficulty color
export const getDifficultyColor = (difficulty) => {
  const colors = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-rose-400',
  };
  return colors[difficulty] || 'text-gray-400';
};

// Get difficulty badge color
export const getDifficultyBadge = (difficulty) => {
  const colors = {
    Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return colors[difficulty] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

// Format time
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};