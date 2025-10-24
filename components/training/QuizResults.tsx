
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface QuizResultsProps {
  score: number;
  passed: boolean;
  onRetake: () => void;
  onBackToHub: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ score, passed, onRetake, onBackToHub }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto text-center bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-lg animate-[fadeInUp_0.5s_ease-out]">
      <h2 className="text-2xl font-bold">{t('quizResults')}</h2>
      <p className="mt-4">{t('yourScore')}:</p>
      <p className={`text-6xl font-bold my-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
        {score}%
      </p>
      <p className={`font-semibold text-xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
        {passed ? t('passed') : t('failed')}
      </p>
      <div className="mt-8">
        {passed ? (
          <button onClick={onBackToHub} className="bg-brand-primary text-white px-6 py-2 rounded-lg">
            {t('backToHub')}
          </button>
        ) : (
          <div className="space-x-4">
             <button onClick={onBackToHub} className="bg-gray-200 dark:bg-gray-700 text-brand-text-primary dark:text-dark-brand-text-primary px-6 py-2 rounded-lg">
                {t('backToHub')}
            </button>
            <button onClick={onRetake} className="bg-brand-primary text-white px-6 py-2 rounded-lg">
                {t('retakeQuiz')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
