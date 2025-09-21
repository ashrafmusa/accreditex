import React from 'react';
import { Project, User, NavigationState } from '@/types';
import { useTranslation } from '../hooks/useTranslation';
import { PlusIcon } from '../components/icons';

interface MockSurveyListPageProps {
  project: Project;
  users: User[];
  onStartMockSurvey: () => void;
  setNavigation: (state: NavigationState) => void;
}

const MockSurveyListPage: React.FC<MockSurveyListPageProps> = ({ project, users, onStartMockSurvey, setNavigation }) => {
  const { t, lang } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{t('mockSurveysHub')}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('mockSurveysHubDescription')}</p>
          </div>
          <button onClick={onStartMockSurvey} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-semibold shadow-sm w-full sm:w-auto">
            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t('startNewSurvey')}
          </button>
        </div>
      </div>
      
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('surveyor')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('dateConducted')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('overallScore')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
              {project.mockSurveys.map(survey => {
                const surveyor = users.find(u => u.id === survey.surveyorId);
                const passCount = survey.results.filter(r => r.result === 'Pass').length;
                const totalScored = survey.results.filter(r => r.result === 'Pass' || r.result === 'Fail').length;
                const score = totalScored > 0 ? Math.round((passCount / totalScored) * 100) : 0;

                return (
                  <tr key={survey.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text-primary dark:text-dark-brand-text-primary">{surveyor?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{new Date(survey.date).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{survey.status === 'Completed' ? `${score}%` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${survey.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                        {survey.status === 'Completed' ? (
                            <button onClick={() => setNavigation({ view: 'surveyReport', projectId: project.id, surveyId: survey.id })} className="text-brand-primary hover:underline">
                                {t('viewReport')}
                            </button>
                        ) : (
                            <button onClick={() => setNavigation({ view: 'mockSurvey', projectId: project.id, surveyId: survey.id })} className="text-brand-primary hover:underline">
                                {t('resumeSurvey')}
                            </button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {project.mockSurveys.length === 0 && (
            <p className="text-center py-8 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noSurveysConducted')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockSurveyListPage;
