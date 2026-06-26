import React, { useState, useEffect } from 'react';
import { useQuiz } from './hooks/useQuiz';
import Navbar from './components/Navbar';
import CategoryFilter from './components/CategoryFilter';
import QuizCard from './components/QuizCard';
import Footer from './components/Footer';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

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
    handleAnswerSelect,
    confirmAnswer,
    handleNext,
    resetQuiz,
    startQuiz,
    isQuizStarted,
    getCategoryColor,
    getAnswerIndex,
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

  // Debug: Log questions by category
  console.log('Selected Category:', selectedCategory);
  console.log('Total Questions:', totalQuestions);
  console.log('Current Question:', currentQuestion);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="main-content">
        <div className="max-w-3xl mx-auto">
          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

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
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;