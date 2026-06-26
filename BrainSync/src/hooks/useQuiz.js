import { useState, useEffect } from 'react';
import { allQuestions } from '../data/questions';

export const useQuiz = () => {
  const [questions] = useState(allQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default to 'All'
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  // Get filtered questions based on category
  const getFilteredQuestions = () => {
    if (selectedCategory === 'All') {
      return questions;
    }
    return questions.filter(q => q.category === selectedCategory);
  };

  const filteredQuestions = getFilteredQuestions();
  const filteredTotal = filteredQuestions.length;
  
  // Current question from filtered list
  const currentQuestion = filteredQuestions[currentIndex] || null;
  const progress = filteredTotal > 0 ? ((currentIndex + 1) / filteredTotal) * 100 : 0;

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerConfirmed(false);
    setShowExplanation(false);
    setIsTimerActive(true);
    setTimeLeft(30);
  }, [selectedCategory]);

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

    const isCorrect = selectedAnswer === getAnswerIndex(currentQuestion.answer);
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
    setIsTimerActive(true);
    setIsQuizStarted(false);
  };

  const startQuiz = () => {
    setIsQuizStarted(true);
    setIsTimerActive(true);
    setTimeLeft(30);
  };

  const getCategoryColor = (category) => {
    const colors = {
      HTML: 'html',
      CSS: 'css',
      JavaScript: 'javascript',
    };
    return colors[category] || 'general';
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
  };
};