import React from 'react';
import { Check, X } from 'lucide-react';

const Options = ({ 
  options, 
  selectedAnswer, 
  correctAnswer, 
  onSelect, 
  showExplanation,
  isAnswerConfirmed 
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  const getOptionClass = (index) => {
    if (isAnswerConfirmed) {
      if (index === correctAnswer) {
        return 'correct';
      }
      if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
        return 'wrong';
      }
      return 'disabled';
    }

    if (selectedAnswer === index) {
      return 'selected';
    }

    return '';
  };

  const getIcon = (index) => {
    if (!isAnswerConfirmed) return null;

    if (index === correctAnswer) {
      return <Check className="w-4 h-4 text-emerald-400" />;
    }

    if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
      return <X className="w-4 h-4 text-rose-400" />;
    }

    return null;
  };

  const isSelected = (index) => {
    return selectedAnswer === index;
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const icon = getIcon(index);
        const optionClass = getOptionClass(index);
        const selected = isSelected(index);

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`option-btn ${optionClass}`}
            disabled={isAnswerConfirmed}
          >
            <span className={`letter ${selected ? 'selected-letter' : ''}`}>
              {letters[index]}
            </span>
            <span className="flex-1 option-text">{option}</span>
            {icon && (
              <span className="flex-shrink-0 ml-2">
                {icon}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Options;