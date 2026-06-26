import React, { useState } from 'react';
import { Trophy, CheckCircle, XCircle, RefreshCw, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';
import { allQuestions } from '../data/questions';

const Result = ({ score, total, answers, onReset }) => {
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);
  
  const percentage = Math.round((score / total) * 100);
  const correctCount = answers.filter(a => a.isCorrect).length;
  const wrongCount = answers.filter(a => !a.isCorrect && !a.isSkipped).length;
  const skippedCount = answers.filter(a => a.isSkipped).length;

  // Get wrong answers (excluding skipped)
  const wrongAnswers = answers
    .map((answer, index) => {
      const question = allQuestions.find(q => q.id === answer.questionId);
      return { ...answer, question, index };
    })
    .filter(a => !a.isCorrect && !a.isSkipped);

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🌟', text: 'Excellent!', color: 'text-emerald-400' };
    if (percentage >= 70) return { emoji: '💪', text: 'Great Job!', color: 'text-blue-400' };
    if (percentage >= 50) return { emoji: '📚', text: 'Keep Learning!', color: 'text-amber-400' };
    return { emoji: '📖', text: 'Keep Practicing!', color: 'text-rose-400' };
  };

  const grade = getGrade();

  return (
    <div className="text-center">
      {/* Score */}
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-purple-500/20 animate-float">
        <Trophy className="w-12 h-12 text-purple-400" />
      </div>

      <div className="mb-2">
        <span className="text-5xl font-bold result-score">{score}</span>
        <span className="text-2xl text-gray-400"> / {total}</span>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-3xl">{grade.emoji}</span>
        <span className={`text-xl font-bold ${grade.color}`}>{grade.text}</span>
      </div>

      <p className="text-gray-400 mb-6">
        You got <span className="text-white font-bold">{percentage}%</span> correct!
      </p>

      {/* Stats Grid - Now shows correct/wrong/skipped separately */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value text-emerald-400">{correctCount}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-rose-400">{wrongCount}</div>
          <div className="stat-label">Wrong</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-amber-400">{skippedCount}</div>
          <div className="stat-label">Skipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-purple-400">{total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Wrong Answers Section - Only shows actually wrong answers, not skipped */}
      {wrongAnswers.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowWrongAnswers(!showWrongAnswers)}
            className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showWrongAnswers ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Wrong Answers ({wrongAnswers.length})
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Wrong Answers ({wrongAnswers.length})
              </>
            )}
          </button>

          {showWrongAnswers && (
            <div className="mt-4 space-y-3 text-left max-h-60 overflow-y-auto">
              {wrongAnswers.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                  <p className="text-sm font-medium text-gray-300">
                    {item.question?.question || 'Unknown Question'}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <span className="text-rose-400">
                      ✗ Your answer: {item.selected !== -1 ? 
                        String.fromCharCode(65 + item.selected) : 'Skipped'}
                    </span>
                    <span className="text-emerald-400">
                      ✓ Correct: {String.fromCharCode(65 + item.correct)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {wrongAnswers.length === 0 && total > 0 && (
        <div className="mb-6 text-emerald-400 text-sm">
          🎉 Perfect! No wrong answers!
        </div>
      )}

      <button onClick={onReset} className="btn-primary flex items-center gap-2 mx-auto">
        <RefreshCw className="w-4 h-4" />
        Play Again
      </button>
    </div>
  );
};

export default Result;