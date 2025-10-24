
import React, { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useTranslation } from '../hooks/useTranslation';
import { NavigationState, MockSurveyResult, MockSurvey } from '../types';
import { ClipboardDocumentSearchIcon } from '../components/icons';
import { useToast } from '../hooks/useToast';

interface MockSurveyPageProps {
    navigation: {
        view: 'mockSurvey';
        projectId: string;
        surveyId: string;
    }
    setNavigation: (nav: NavigationState) => void;
}

const MockSurveyPage: React.FC<MockSurveyPageProps> = ({ navigation, setNavigation }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const { projects, updateMockSurvey } = useProjectStore();
    const project = projects.find(p => p.id === navigation.projectId);
    const survey = project?.mockSurveys.find(s => s.id === navigation.surveyId);
    
    const [results, setResults] = useState<Record<string, MockSurveyResult>>(
        survey?.results.reduce((acc, r) => ({ ...acc, [r.checklistItemId]: r }), {}) || {}
    );
    
    if (!project || !survey) {
        return <div>{t('surveyNotFound')}</div>;
    }

    const handleResultChange = (itemId: string, result: MockSurveyResult['result'], notes: string = '') => {
        setResults(prev => ({
            ...prev,
            [itemId]: { checklistItemId: itemId, result, notes: prev[itemId]?.notes || notes }
        }));
    };
    
    const handleNotesChange = (itemId: string, notes: string) => {
        setResults(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], notes }
        }));
    };
    
    const handleSave = () => {
        updateMockSurvey(project.id, survey.id, { results: Object.values(results) });
        toast.success(t('progressSaved'));
    };
    
    const handleFinalize = () => {
        const finalResults = Object.values(results);
        const totalApplicable = finalResults.filter(r => r.result !== 'Not Applicable').length;
        const passed = finalResults.filter(r => r.result === 'Pass').length;
        const score = totalApplicable > 0 ? Math.round((passed / totalApplicable) * 100) : 100;

        updateMockSurvey(project.id, survey.id, { 
            results: finalResults,
            status: 'Completed',
            finalScore: score
        });
        toast.success(t('surveyFinalized'));
        setNavigation({ view: 'surveyReport', projectId: project.id, surveyId: survey.id });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('conductingSurvey')}</h1>
                    <p className="text-brand-text-secondary mt-1">{project.name}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="bg-white dark:bg-slate-700 text-brand-text-primary dark:text-dark-brand-text-primary border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg font-semibold">{t('saveProgress')}</button>
                    <button onClick={handleFinalize} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold">{t('finalizeSurvey')}</button>
                </div>
            </div>

            <div className="space-y-4">
                {project.checklist.map(item => (
                    <div key={item.id} className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg border border-brand-border dark:border-dark-brand-border">
                        <p className="font-semibold">{item.item}</p>
                        <p className="text-xs text-gray-500">{t('standard')}: {item.standardId}</p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleResultChange(item.id, 'Pass')} className={`px-3 py-1 rounded-full text-sm ${results[item.id]?.result === 'Pass' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('pass')}</button>
                                <button onClick={() => handleResultChange(item.id, 'Fail')} className={`px-3 py-1 rounded-full text-sm ${results[item.id]?.result === 'Fail' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('fail')}</button>
                                <button onClick={() => handleResultChange(item.id, 'Not Applicable')} className={`px-3 py-1 rounded-full text-sm ${results[item.id]?.result === 'Not Applicable' ? 'bg-gray-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('notApplicable')}</button>
                            </div>
                            <input
                                type="text"
                                placeholder={t('surveyorNotes')}
                                value={results[item.id]?.notes || ''}
                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                className="w-full sm:flex-grow border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MockSurveyPage;
