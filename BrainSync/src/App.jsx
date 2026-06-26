import React, { useState, useEffect } from 'react';
import { useQuiz } from './hooks/useQuiz';
import Navbar from './components/Navbar';
import CategoryFilter from './components/CategoryFilter';
import DifficultyFilter from './components/DifficultyFilter';
import QuizCard from './components/QuizCard';
import Footer from './components/Footer';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  const {
    currentQuestion,
    currentIndex,
    selectedAnswer,
    isAnswerConfirmed,
    score,
    isComplete,
    showExplanation,
    answers,
    timeLeft,
    progress,
    totalQuestions,
    filteredQuestions,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    handleAnswerSelect,
    confirmAnswer,
    handleNext,
    resetQuiz,
    startQuiz,
    isQuizStarted,
    getCategoryColor,
    getAnswerIndex,
    leaderboard,
    clearLeaderboard,
    showFilters,
    categoryQuestions,
    totalAllQuestions,
    history,
    clearHistory,
  } = useQuiz();

  useEffect(() => {
    const theme = localStorage.getItem('quiz_theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('quiz_theme', next ? 'dark' : 'light');
  };

  const handleLeaderboardClose = () => setShowLeaderboard(false);
  const handleLeaderboardOpen = () => setShowLeaderboard(true);

  const handleHistoryClose = () => setShowHistory(false);
  const handleHistoryOpen = () => setShowHistory(true);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowLevels(true);
  };

  const handleBackToTopics = () => {
    setShowLevels(false);
    setSelectedDifficulty('All');
  };

  const handleStartQuiz = () => {
    startQuiz();
    setShowLevels(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        darkMode={darkMode} 
        toggleTheme={toggleTheme}
        onLeaderboardClick={handleLeaderboardOpen}
        onHistoryClick={handleHistoryOpen}
      />

      <main className="main-content">
        <div className="max-w-3xl mx-auto">
          {/* Category Selection - Always shown first */}
          {!isQuizStarted && !isComplete && (
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategorySelect}
              showFilters={true}
            />
          )}

          {/* Level Selection - Shown after category is selected */}
          {!isQuizStarted && !isComplete && showLevels && selectedCategory !== 'All' && (
            <DifficultyFilter
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              showFilters={true}
              totalQuestions={totalAllQuestions}
              categoryQuestions={categoryQuestions}
              selectedCategory={selectedCategory}
              onBackToTopics={handleBackToTopics}
            />
          )}

          {/* Quick Start for "All" category */}
          {!isQuizStarted && !isComplete && selectedCategory === 'All' && (
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  setSelectedDifficulty('All');
                  startQuiz();
                }}
                className="btn-primary flex items-center gap-2 mx-auto text-lg px-8 py-3.5"
              >
                Start Quiz with All Topics
              </button>
            </div>
          )}

          {/* Start button for specific category with level selected */}
          {!isQuizStarted && !isComplete && selectedCategory !== 'All' && selectedDifficulty !== 'All' && (
            <div className="text-center mb-6">
              <button
                onClick={startQuiz}
                className="btn-primary flex items-center gap-2 mx-auto text-lg px-8 py-3.5"
              >
                Start {selectedCategory} Quiz ({selectedDifficulty})
              </button>
            </div>
          )}

          {/* Quiz Card */}
          <QuizCard
            currentQuestion={currentQuestion}
            currentIndex={currentIndex}
            selectedAnswer={selectedAnswer}
            isAnswerConfirmed={isAnswerConfirmed}
            score={score}
            isComplete={isComplete}
            showExplanation={showExplanation}
            answers={answers}
            timeLeft={timeLeft}
            progress={progress}
            totalQuestions={totalQuestions}
            onAnswerSelect={handleAnswerSelect}
            confirmAnswer={confirmAnswer}
            onNext={handleNext}
            onReset={resetQuiz}
            startQuiz={startQuiz}
            isQuizStarted={isQuizStarted}
            getCategoryColor={getCategoryColor}
            getAnswerIndex={getAnswerIndex}
            showFilters={showFilters}
          />
        </div>
      </main>

      <Footer />

      {showLeaderboard && (
        <Leaderboard
          leaderboard={leaderboard}
          onClose={handleLeaderboardClose}
          onClear={clearLeaderboard}
        />
      )}

      {showHistory && (
        <History
          history={history}
          onClose={handleHistoryClose}
          onClear={clearHistory}
        />
      )}
    </div>
  );
};

export default App;