
import React, { useState } from 'react';
import { TrainingProgram, User, NavigationState } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/components/common/ThemeProvider';
import { useAppStore } from '@/stores/useAppStore';

interface TrainingDetailPageProps {
  trainingProgram: TrainingProgram;
  setNavigation: (state: NavigationState) => void;
}

const TrainingDetailPage: React.FC<TrainingDetailPageProps> = ({ trainingProgram, setNavigation }) => {
  const { t, lang } = useTranslation();
  const { theme } = useTheme();
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean, certificateId: string | null } | null>(null);
  const onQuizSubmit = useAppStore(state => state.submitQuiz);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length !== trainingProgram.quiz.length) {
        alert("Please answer all questions before submitting.");
        return;
    }
    const result = await onQuizSubmit(trainingProgram.id, answers);
    setQuizResult(result);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <h1 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{trainingProgram.title[lang]}</h1>
        <div className={`mt-4 prose max-w-none ${theme === 'dark' ? 'dark-prose' : ''}`} dangerouslySetInnerHTML={{ __html: trainingProgram.content[lang] }} />
      </div>

      <div className="bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <h2 className="text-2xl font-semibold border-b pb-4 mb-6">{t('quizSection')}</h2>

        {!quizResult ? (
            <form onSubmit={handleSubmit} className="space-y-8">
            {trainingProgram.quiz.map((q, index) => (
                <div key={q.id}>
                <p className="font-semibold">{index + 1}. {q.question[lang]}</p>
                <div className="mt-2 space-y-2">
                    {q.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <input
                        type="radio"
                        name={q.id}
                        value={optionIndex}
                        onChange={() => handleAnswerChange(q.id, optionIndex)}
                        checked={answers[q.id] === optionIndex}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900"
                        />
                        <span>{option[lang]}</span>
                    </label>
                    ))}
                </div>
                </div>
            ))}
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">{t('submitQuiz')}</button>
            </div>
            </form>
        ) : (
            <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">{t('yourScore')}: <span className={quizResult.passed ? 'text-brand-success' : 'text-red-500'}>{quizResult.score}%</span></h3>
                <p className="text-sm text-gray-500">{t('passingScore')}: {trainingProgram.passingScore}%</p>
                <p className={`font-semibold ${quizResult.passed ? 'text-brand-success' : 'text-red-500'}`}>
                    {quizResult.passed ? t('quizPassed') : t('quizFailed')}
                </p>
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button onClick={() => setNavigation({ view: 'trainingHub'})} className="bg-gray-200 dark:bg-gray-600 text-brand-text-primary dark:text-dark-brand-text-primary px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('backToHub')}</button>
                    {quizResult.passed && quizResult.certificateId && (
                        <button onClick={() => setNavigation({ view: 'certificate', certificateId: quizResult.certificateId! })} className="bg-brand-primary text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-semibold">{t('viewCertificate')}</button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrainingDetailPage;