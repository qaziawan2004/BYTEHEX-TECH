import React, { useState } from 'react';
import Question from './Question';
import Options from './Options';
import Progress from './Progress';
import Timer from './Timer';
import Result from './Result';
import { Sparkles, Play, Zap, Check, ChevronRight, Shuffle } from 'lucide-react';

const QuizCard = ({ 
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
  onAnswerSelect,
  confirmAnswer,
  onNext,
  onReset,
  getCategoryColor,
  getAnswerIndex,
  isQuizStarted,
  startQuiz,
  selectedCategory,
  selectedDifficulty
}) => {
  const [isStarting, setIsStarting] = useState(false);

  // Start Screen
  if (!isQuizStarted) {
    const categoryName = selectedCategory !== 'All' ? selectedCategory : 'All Topics';
    const levelName = selectedDifficulty !== 'All' ? selectedDifficulty : 'Mixed';
    const questionCount = totalQuestions;
    
    return (
      <div className="quiz-card text-center py-12">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-purple-500/30 animate-float">
          <Sparkles className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Ready to Test Your Knowledge?
        </h2>
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
            {categoryName}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-600/20 text-gray-400 text-sm font-medium">
            {levelName}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
            {questionCount} Questions
          </span>
        </div>
        <p className="text-gray-400 mb-2 max-w-md mx-auto">
          You'll have <span className="text-purple-400 font-semibold">30 seconds</span> per question.
          Questions are shuffled for a unique experience!
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {totalQuestions} Questions
          </span>
          <span className="w-px h-4 bg-gray-700" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            30s Timer
          </span>
          <span className="w-px h-4 bg-gray-700" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <Shuffle className="w-3 h-3" />
            Shuffled
          </span>
        </div>
        <button
          onClick={() => {
            setIsStarting(true);
            setTimeout(() => {
              startQuiz();
              setIsStarting(false);
            }, 500);
          }}
          disabled={isStarting || totalQuestions === 0}
          className="mt-8 btn-primary flex items-center gap-3 mx-auto text-lg px-8 py-3.5"
        >
          {isStarting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Starting...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Quiz
            </>
          )}
        </button>
        {totalQuestions === 0 && (
          <p className="text-rose-400 text-sm mt-2">No questions available for this selection</p>
        )}
      </div>
    );
  }

  if (!currentQuestion && !isComplete) {
    return (
      <div className="quiz-card text-center py-12">
        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Questions Available</h2>
        <p className="text-gray-400 mt-2">Please select a category with questions</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="quiz-card">
        <Result
          score={score}
          total={totalQuestions}
          answers={answers}
          onReset={onReset}
        />
      </div>
    );
  }

  const categoryColor = getCategoryColor(currentQuestion?.category || '');
  const isCorrect = selectedAnswer !== null && selectedAnswer !== -1 && 
    selectedAnswer === getAnswerIndex(currentQuestion?.answer || 'A');

  return (
    <div className="quiz-card animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`category-badge ${categoryColor}`}>
            {currentQuestion?.category}
          </span>
          {currentQuestion?.difficulty && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              currentQuestion.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              currentQuestion.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {currentQuestion.difficulty}
            </span>
          )}
          {isAnswerConfirmed && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isCorrect ? '✅ Correct' : '❌ Incorrect'}
            </span>
          )}
        </div>
        <Timer timeLeft={timeLeft} isAnswerConfirmed={isAnswerConfirmed} />
      </div>

      {/* Progress */}
      <Progress
        current={currentIndex + 1}
        total={totalQuestions}
        progress={progress}
      />

      {/* Question */}
      <div className="mt-6">
        <Question
          question={currentQuestion}
          index={currentIndex}
          total={totalQuestions}
        />
      </div>

      {/* Options */}
      <div className="mt-4">
        <Options
          options={currentQuestion?.options || []}
          selectedAnswer={selectedAnswer}
          correctAnswer={getAnswerIndex(currentQuestion?.answer || 'A')}
          onSelect={onAnswerSelect}
          showExplanation={showExplanation}
          isAnswerConfirmed={isAnswerConfirmed}
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {!isAnswerConfirmed && selectedAnswer !== null && selectedAnswer !== -1 && (
          <button
            onClick={confirmAnswer}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirm Answer
          </button>
        )}

        {isAnswerConfirmed && (
          <button
            onClick={onNext}
            className="btn-primary flex items-center gap-2"
          >
            {currentIndex < totalQuestions - 1 ? (
              <>
                Next Question
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                See Results 🏆
              </>
            )}
          </button>
        )}

        {!isAnswerConfirmed && selectedAnswer === null && (
          <button
            onClick={confirmAnswer}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            Skip Question
          </button>
        )}
      </div>

      {/* Fun Fact */}
      {showExplanation && currentQuestion?.funFact && (
        <div className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 animate-fade-in-up">
          <p className="text-sm text-gray-400 flex items-start gap-2">
            <span className="text-purple-400 font-medium">💡 Did you know?</span>
            <span>{currentQuestion.funFact}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;