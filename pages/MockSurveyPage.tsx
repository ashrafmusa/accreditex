import React, { useState } from 'react';
// FIX: Corrected import path for types
import { Project, MockSurvey, User, MockSurveyResult, NavigationState } from '../types';
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

const MockSurveyPage: React.FC<MockSurveyPageProps> = ({ project, survey, users, onUpdateSurvey, onSaveAndExit, setNavigation }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<MockSurveyResult[]>(survey.results);
  
  const currentChecklistItem = project.checklist[currentIndex];
  const currentResult = results.find(r => r.checklistItemId === currentChecklistItem.id);
  const assignedUser = users.find(u => u.id === currentChecklistItem.assignedTo);

  const handleSaveAndExit = () => {
    onSaveAndExit(project.id, { ...survey, results });
    setNavigation({ view: 'projectDetail', projectId: project.id });
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
        setNavigation({ view: 'surveyReport', projectId: project.id, surveyId: survey.id });
    }
  };
  
  const resultButtonClass = (isActive: boolean) => 
    `flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 ${
      isActive ? 'text-white' : ''
    }`;

  if (!currentChecklistItem || !currentResult) return <div>Loading...</div>;

  const progressPercentage = ((currentIndex + 1) / project.checklist.length) * 100;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-dark-brand-surface p-4 flex justify-between items-center shadow-md">
          <div>
            <h1 className="font-bold text-lg">{t('mockSurvey')}: {project.name}</h1>
            <p className="text-sm text-gray-500">{t('surveyProgress').replace('{current}', String(currentIndex + 1)).replace('{total}', String(project.checklist.length))}</p>
          </div>
          <button onClick={handleSaveAndExit} className="text-sm font-semibold text-brand-primary">{t('saveAndExit')}</button>
      </header>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
        <div className="bg-brand-primary h-1" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <main className="flex-grow p-4 sm:p-8 flex justify-center items-center">
        <div className="w-full max-w-3xl bg-white dark:bg-dark-brand-surface rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <p className="text-sm font-semibold text-brand-primary">{currentChecklistItem.standardId}</p>
            <p className="text-xl font-semibold mt-1">{currentChecklistItem.item}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">{t('originalItemDetails')}</h3>
            <p className="text-sm mt-1"><strong>{t('status')}:</strong> {currentChecklistItem.status}</p>
            <p className="text-sm mt-1"><strong>{t('assignedTo')}:</strong> {assignedUser?.name || t('unassigned')}</p>
            {currentChecklistItem.actionPlan && <p className="text-sm mt-1"><strong>{t('actionPlan')}:</strong> {currentChecklistItem.actionPlan}</p>}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Evaluation</h3>
            <div className="flex gap-4">
                <button onClick={() => updateResult('Pass')} className={`${resultButtonClass(currentResult.result === 'Pass')} bg-green-500 border-green-600`}><CheckCircleIcon className="w-5 h-5"/> {t('pass')}</button>
                <button onClick={() => updateResult('Fail')} className={`${resultButtonClass(currentResult.result === 'Fail')} bg-red-500 border-red-600`}><XCircleIcon className="w-5 h-5"/> {t('fail')}</button>
                <button onClick={() => updateResult('Not Applicable')} className={`${resultButtonClass(currentResult.result === 'Not Applicable')} bg-gray-500 border-gray-600`}><MinusCircleIcon className="w-5 h-5"/> {t('notApplicable')}</button>
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="text-sm font-medium">{t('surveyorNotes')}</label>
            <textarea
              id="notes"
              rows={3}
              value={currentResult.notes}
              onChange={(e) => updateResult(currentResult.result, e.target.value)}
              className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-dark-brand-surface p-4 flex justify-between items-center shadow-inner">
        <button onClick={goToPrev} disabled={currentIndex === 0} className="px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50">« {t('previous')}</button>
        {currentIndex === project.checklist.length - 1 ? (
          <button onClick={handleFinalize} className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
            {t('finalizeSurvey')}
          </button>
        ) : (
          <button onClick={goToNext} disabled={currentIndex === project.checklist.length - 1} className="px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50">{t('next')} »</button>
        )}
      </footer>
    </div>
  );
};

export default MockSurveyPage;
