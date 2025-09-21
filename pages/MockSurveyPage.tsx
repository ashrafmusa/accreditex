import React, { useState } from 'react';
import { Project, MockSurvey, User, MockSurveyResult, NavigationState } from '@/types';
import { useTranslation } from '../hooks/useTranslation';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '../components/icons';

interface MockSurveyPageProps {
  project: Project;
  survey: MockSurvey;
  users: User[];
  onUpdateSurvey: (projectId: string, survey: MockSurvey) => void;
  onSaveAndExit: (projectId: string, survey: MockSurvey) => void;
  setNavigation: (state: NavigationState) => void;
}

const MockSurveyPage: React.FC<MockSurveyPageProps> = ({ project, survey, users, onUpdateSurvey, onSaveAndExit }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<MockSurveyResult[]>(survey.results);
  
  const currentChecklistItem = project.checklist[currentIndex];
  const currentResult = results.find(r => r.checklistItemId === currentChecklistItem.id);
  const assignedUser = users.find(u => u.id === currentChecklistItem.assignedTo);

  const handleSaveAndExit = () => {
    onSaveAndExit(project.id, { ...survey, results });
  };

  const updateResult = (result: 'Pass' | 'Fail' | 'Not Applicable', notes?: string) => {
    const newResults = results.map(r => {
      if (r.checklistItemId === currentChecklistItem.id) {
        return { ...r, result, notes: notes !== undefined ? notes : r.notes };
      }
      return r;
    });
    setResults(newResults);
  };
  
  const goToNext = () => {
    if (currentIndex < project.checklist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinalize = () => {
    if (window.confirm(t('areYouSureFinalize'))) {
        onUpdateSurvey(project.id, { ...survey, results, status: 'Completed' });
    }
  };
  
  const resultButtonClass = (isActive: boolean) => 
    `flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 ${
      isActive ? 'text-white' : ''
    }`;

  if (!currentChecklistItem || !currentResult) return <div>Loading...</div>;

  const progressPercentage = ((currentIndex + 1) / project.checklist.length) * 100;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <header className="bg-brand-surface dark:bg-dark-brand-surface p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{project.name}</h1>
                    <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('mockSurvey')}</p>
                </div>
                <button onClick={handleSaveAndExit} className="text-sm font-semibold text-brand-primary hover:underline">{t('saveAndExit')}</button>
            </div>
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary text-center mt-1">
                {t('surveyProgress').replace('{current}', (currentIndex + 1).toString()).replace('{total}', project.checklist.length.toString())}
            </p>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col justify-center items-center p-4 md:p-8">
        <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-xl shadow-2xl w-full max-w-3xl">
          <div className="p-8">
            <p className="text-sm font-semibold text-brand-primary">{currentChecklistItem.standardId}</p>
            <p className="mt-2 text-xl text-brand-text-primary dark:text-dark-brand-text-primary">{currentChecklistItem.item}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 space-y-4">
            <div className="border-b dark:border-dark-brand-border pb-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('originalItemDetails')}</h4>
                <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p><strong className="font-medium text-gray-600 dark:text-gray-400">{t('assignedTo')}:</strong> {assignedUser ? assignedUser.name : t('unassigned')}</p>
                    <p><strong className="font-medium text-gray-600 dark:text-gray-400">{t('notes')}:</strong> {currentChecklistItem.notes || 'N/A'}</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => updateResult('Pass')}
                    className={`${resultButtonClass(currentResult.result === 'Pass')} border-green-500 hover:bg-green-500 hover:text-white ${currentResult.result === 'Pass' ? 'bg-green-500' : 'text-green-500'}`}
                ><CheckCircleIcon className="w-5 h-5" /> {t('pass')}</button>
                <button 
                    onClick={() => updateResult('Fail')}
                    className={`${resultButtonClass(currentResult.result === 'Fail')} border-red-500 hover:bg-red-500 hover:text-white ${currentResult.result === 'Fail' ? 'bg-red-500' : 'text-red-500'}`}
                ><XCircleIcon className="w-5 h-5" /> {t('fail')}</button>
                <button 
                    onClick={() => updateResult('Not Applicable')}
                    className={`${resultButtonClass(currentResult.result === 'Not Applicable')} border-gray-400 hover:bg-gray-400 hover:text-white ${currentResult.result === 'Not Applicable' ? 'bg-gray-400' : 'text-gray-400'}`}
                ><MinusCircleIcon className="w-5 h-5" /> {t('notApplicable')}</button>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{t('surveyorNotes')}</label>
                <textarea 
                    value={currentResult.notes}
                    onChange={(e) => updateResult(currentResult.result, e.target.value)}
                    rows={4}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-brand-surface dark:bg-dark-brand-surface p-4 flex justify-between items-center shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
        <button onClick={goToPrev} disabled={currentIndex === 0} className="px-6 py-2 rounded-lg font-semibold disabled:opacity-50 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t('previous')}</button>
        {currentIndex === project.checklist.length - 1 ? (
             <button onClick={handleFinalize} className="px-6 py-2 rounded-lg font-semibold bg-brand-success text-white hover:bg-green-700">{t('finalizeSurvey')}</button>
        ) : (
            <button onClick={goToNext} className="px-6 py-2 rounded-lg font-semibold bg-brand-primary text-white hover:bg-indigo-700">{t('next')}</button>
        )}
      </footer>
    </div>
  );
};

export default MockSurveyPage;
