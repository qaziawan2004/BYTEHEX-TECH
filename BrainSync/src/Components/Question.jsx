import React from 'react';
import { HelpCircle, Hash } from 'lucide-react';

const Question = ({ question, index, total }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Hash className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">
            Question {index + 1} of {total}
          </span>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
        {question.question}
      </h2>
    </div>
  );
};

export default Question;