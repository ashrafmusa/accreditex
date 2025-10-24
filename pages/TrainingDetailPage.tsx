

import React, { useState, useEffect } from 'react';
import { TrainingProgram, UserTrainingStatus, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { AcademicCapIcon } from '../components/icons';
import QuizResults from '../components/training/QuizResults';

interface TrainingDetailPageProps {
  program: TrainingProgram;
  userStatus: UserTrainingStatus[string];
  onStatusUpdate: (status: 'In Progress' | 'Completed', score?: number) => void;
  onGenerateCertificate: (score: number) => void;
  setNavigation: (state: NavigationState) => void;
}

const TrainingDetailPage: React.FC<TrainingDetailPageProps> = ({ program, userStatus, onStatusUpdate, onGenerateCertificate, setNavigation }) => {
  const { t, lang } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (userStatus?.status !== 'Completed') {
      onStatusUpdate('In Progress');
    }
  }, [onStatusUpdate, userStatus]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    program.quiz.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctAnswers++;
      }
    });
    const calculatedScore = Math.round((correctAnswers / program.quiz.length) * 100);
    setScore(calculatedScore);
    setShowResults(true);
    if (calculatedScore >= program.passingScore) {
        onStatusUpdate('Completed', calculatedScore);
        onGenerateCertificate(calculatedScore);
    } else {
        onStatusUpdate('In Progress', calculatedScore);
    }
  };

  if (showResults) {
    return (
      <QuizResults
        score={score}
        passed={score >= program.passingScore}
        onRetake={() => { setShowResults(false); setAnswers({}); }}
        onBackToHub={() => setNavigation({ view: 'trainingHub' })}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
        <AcademicCapIcon className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold">{program.title[lang]}</h1>
          <p className="text-brand-text-secondary mt-1">{program.description[lang]}</p>
        </div>
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-md border border-brand-border dark:border-dark-brand-border">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program.content[lang] }} />
      </div>

      <div className="bg-brand-surface dark:bg-dark-brand-surface p-8 rounded-lg shadow-md border border-brand-border dark:border-dark-brand-border">
          {/* FIX: Cast translation key to any */}
          <h2 className="text-2xl font-bold mb-6">{t('quiz' as any)}</h2>
          <div className="space-y-8">
            {program.quiz.map((q, qIndex) => (
                <div key={q.id}>
                    <p className="font-semibold">{qIndex + 1}. {q.question[lang]}</p>
                    <div className="mt-4 space-y-3">
                        {q.options.map((opt, oIndex) => (
                            <label key={oIndex} className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg border dark:border-dark-brand-border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input
                                    type="radio"
                                    name={q.id}
                                    checked={answers[q.id] === oIndex}
                                    onChange={() => handleAnswerChange(q.id, oIndex)}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                                />
                                <span>{opt[lang]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
          </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSubmit} className="bg-brand-primary text-white px-8 py-3 rounded-lg text-lg font-semibold">{t('submitAnswers')}</button>
      </div>
    </div>
  );
};

export default TrainingDetailPage;
