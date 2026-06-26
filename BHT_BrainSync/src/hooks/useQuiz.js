import { useState, useEffect } from 'react';
import { allQuestions } from '../data/questions';

export const useQuiz = () => {
  const [allQuestionsData] = useState(allQuestions);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('quiz_leaderboard');
    if (savedLeaderboard) {
      try {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } catch (_) {}
    }
    
    const savedHistory = localStorage.getItem('quiz_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (_) {}
    }
  }, []);

  // Save to leaderboard
  const saveToLeaderboard = (score, total) => {
    const entry = {
      id: Date.now(),
      score,
      total,
      percentage: Math.round((score / total) * 100),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    
    const updatedLeaderboard = [...leaderboard, entry].sort((a, b) => b.percentage - a.percentage).slice(0, 10);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('quiz_leaderboard', JSON.stringify(updatedLeaderboard));
    
    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('quiz_history', JSON.stringify(updatedHistory));
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get filtered questions based on category and difficulty
  const getFilteredQuestions = () => {
    let filtered = [...allQuestionsData];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    
    // Smart difficulty filtering - always shuffle
    if (selectedDifficulty === 'Easy') {
      // All questions
      filtered = shuffleArray(filtered);
    } else if (selectedDifficulty === 'Medium') {
      // Half of the questions
      const shuffled = shuffleArray(filtered);
      filtered = shuffled.slice(0, Math.ceil(shuffled.length / 2));
    } else if (selectedDifficulty === 'Hard') {
      // Only 3 questions
      const shuffled = shuffleArray(filtered);
      filtered = shuffled.slice(0, Math.min(3, shuffled.length));
    } else {
      // 'All' - shuffle all questions
      filtered = shuffleArray(filtered);
    }
    
    return filtered;
  };

  // Reset and shuffle when category or difficulty changes
  useEffect(() => {
    if (selectedCategory && selectedDifficulty) {
      const newQuestions = getFilteredQuestions();
      setCurrentQuestions(newQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerConfirmed(false);
      setShowExplanation(false);
      setIsTimerActive(false);
      setTimeLeft(30);
      setIsComplete(false);
      setScore(0);
      setAnswers([]);
      setIsQuizStarted(false);
      setShowFilters(true);
    }
  }, [selectedCategory, selectedDifficulty]);

  const filteredTotal = currentQuestions.length;
  const currentQuestion = currentQuestions[currentIndex] || null;
  const progress = filteredTotal > 0 ? ((currentIndex + 1) / filteredTotal) * 100 : 0;

  // Timer
  useEffect(() => {
    if (isComplete || !isTimerActive || !currentQuestion || !isQuizStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (selectedAnswer !== null && !isAnswerConfirmed) {
            confirmAnswer();
          } else if (selectedAnswer === null) {
            setSelectedAnswer(-1);
            confirmAnswer();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isComplete, isTimerActive, selectedAnswer, isQuizStarted, currentQuestion]);

  const getAnswerIndex = (letter) => {
    const map = { A: 0, B: 1, C: 2, D: 3 };
    return map[letter] !== undefined ? map[letter] : 0;
  };

  const handleAnswerSelect = (index) => {
    if (isAnswerConfirmed) return;
    setSelectedAnswer(index);
  };

  const confirmAnswer = () => {
    if (isAnswerConfirmed) return;
    if (selectedAnswer === null) {
      setSelectedAnswer(-1);
    }
    
    setIsAnswerConfirmed(true);
    setIsTimerActive(false);
    setShowExplanation(true);

    const isCorrect = selectedAnswer !== -1 && selectedAnswer === getAnswerIndex(currentQuestion.answer);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selected: selectedAnswer === -1 ? -1 : selectedAnswer,
        correct: getAnswerIndex(currentQuestion.answer),
        isCorrect: selectedAnswer === -1 ? false : isCorrect,
        isSkipped: selectedAnswer === -1,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < filteredTotal - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerConfirmed(false);
      setShowExplanation(false);
      setIsTimerActive(true);
      setTimeLeft(30);
    } else {
      setIsComplete(true);
      saveToLeaderboard(score, filteredTotal);
      setShowFilters(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerConfirmed(false);
    setScore(0);
    setIsComplete(false);
    setShowExplanation(false);
    setAnswers([]);
    setTimeLeft(30);
    setIsTimerActive(false);
    setIsQuizStarted(false);
    setShowFilters(true);
    // Reshuffle questions on reset
    const newQuestions = getFilteredQuestions();
    setCurrentQuestions(newQuestions);
  };

  const startQuiz = () => {
    // Shuffle questions again before starting
    const shuffledQuestions = shuffleArray(currentQuestions);
    setCurrentQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerConfirmed(false);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
    setIsQuizStarted(true);
    setIsTimerActive(true);
    setTimeLeft(30);
    setShowFilters(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      HTML: 'html',
      CSS: 'css',
      JavaScript: 'javascript',
    };
    return colors[category] || 'general';
  };

  const clearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem('quiz_leaderboard');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('quiz_history');
  };

  const getCategoryQuestions = () => {
    if (selectedCategory === 'All') return allQuestionsData;
    return allQuestionsData.filter(q => q.category === selectedCategory);
  };

  // Shuffle options within a question
  const shuffleOptions = (question) => {
    if (!question) return question;
    const options = [...question.options];
    const shuffledOptions = shuffleArray(options);
    // Find which option was the correct answer
    const correctIndex = question.options.indexOf(question.options[getAnswerIndex(question.answer)]);
    const newCorrectIndex = shuffledOptions.indexOf(question.options[correctIndex]);
    return {
      ...question,
      options: shuffledOptions,
      answer: String.fromCharCode(65 + newCorrectIndex) // Convert back to A, B, C, D
    };
  };

  // Shuffle options for all questions
  const shuffleAllOptions = (questions) => {
    return questions.map(q => shuffleOptions(q));
  };

  return {
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
    totalQuestions: filteredTotal,
    currentQuestions,
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
    history,
    clearHistory,
    showFilters,
    setShowFilters,
    categoryQuestions: getCategoryQuestions(),
    totalAllQuestions: allQuestionsData.length,
    shuffleArray,
    shuffleAllOptions,
  };
};