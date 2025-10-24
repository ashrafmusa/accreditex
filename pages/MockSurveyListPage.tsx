
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';
import { ClipboardDocumentSearchIcon, PlayCircleIcon } from '../components/icons';
import { MockSurvey, NavigationState } from '../types';
import EmptyState from '../components/common/EmptyState';

interface MockSurveyListPageProps {
    setNavigation: (nav: NavigationState) => void;
}

const MockSurveyListPage: React.FC<MockSurveyListPageProps> = ({ setNavigation }) => {
    const { t } = useTranslation();
    const { projects } = useProjectStore();
    const { users } = useAppStore();

    const allSurveys = projects.flatMap(p => p.mockSurveys.map(s => ({
        ...s,
        projectId: p.id,
        projectName: p.name,
        surveyorName: users.find(u => u.id === s.surveyorId)?.name || 'Unknown'
    })));

    const handleSelectSurvey = (projectId: string, surveyId: string, status: MockSurvey['status']) => {
        if (status === 'Completed') {
            setNavigation({ view: 'surveyReport', projectId, surveyId });
        } else {
            setNavigation({ view: 'mockSurvey', projectId, surveyId });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <ClipboardDocumentSearchIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{t('mockSurveysHub')}</h1>
                    <p className="text-brand-text-secondary mt-1">{t('mockSurveysHubDescription')}</p>
                </div>
            </div>

            {allSurveys.length > 0 ? (
                 <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('surveyDate')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('surveyor')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-gray-200 dark:divide-dark-brand-border">
                                {allSurveys.map(survey => (
                                    <tr key={survey.id}>
                                        <td className="px-6 py-4 font-medium">{survey.projectName}</td>
                                        <td className="px-6 py-4 text-sm">{new Date(survey.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm">{survey.surveyorName}</td>
                                        <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 text-xs rounded-full ${survey.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t(survey.status === 'Completed' ? 'completed' : 'inProgress')}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleSelectSurvey(survey.projectId, survey.id, survey.status)} className="text-sm font-semibold text-brand-primary flex items-center gap-1">
                                                <PlayCircleIcon className="w-5 h-5"/>
                                                {survey.status === 'Completed' ? t('viewReport') : t('startSurvey')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : <EmptyState icon={ClipboardDocumentSearchIcon} title={t('noSurveys')} message={t('noSurveysMessage')} />}
        </div>
    );
};

export default MockSurveyListPage;
