
import React, { useMemo } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useTranslation } from '../hooks/useTranslation';
import { NavigationState, MockSurveyResult } from '../types';
import { ClipboardDocumentCheckIcon, CheckCircleIcon, XCircleIcon, SlashCircleIcon } from '../components/icons';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useTheme } from '../components/common/ThemeProvider';

interface SurveyReportPageProps {
    navigation: {
        view: 'surveyReport';
        projectId: string;
        surveyId: string;
    }
}

const SurveyReportPage: React.FC<SurveyReportPageProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { projects } = useProjectStore();
    const project = projects.find(p => p.id === navigation.projectId);
    const survey = project?.mockSurveys.find(s => s.id === navigation.surveyId);

    const stats = useMemo(() => {
        if (!survey) return { passed: 0, failed: 0, na: 0, total: 0 };
        return {
            passed: survey.results.filter(r => r.result === 'Pass').length,
            failed: survey.results.filter(r => r.result === 'Fail').length,
            na: survey.results.filter(r => r.result === 'Not Applicable').length,
            total: survey.results.length,
        };
    }, [survey]);

    if (!project || !survey) {
        return <div>{t('surveyNotFound')}</div>;
    }

    const chartData = [{ name: 'Score', value: survey.finalScore || 0 }];
    const chartColor = (survey.finalScore || 0) >= 80 ? '#22c55e' : (survey.finalScore || 0) >= 60 ? '#f97316' : '#ef4444';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('surveyReport')}</h1>
                <p className="text-brand-text-secondary mt-1">{project.name} - {new Date(survey.date).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg border border-brand-border dark:border-dark-brand-border flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold">{t('overallScore')}</h3>
                    <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background={{ fill: theme === 'dark' ? '#334155' : '#e2e8f0' }} dataKey="value" cornerRadius={10} fill={chartColor} angleAxisId={0} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-current">{`${survey.finalScore}%`}</text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-green-50 dark:bg-green-900/50 p-6 rounded-lg flex items-center gap-4"><CheckCircleIcon className="w-8 h-8 text-green-500"/><div className="font-bold"><p className="text-3xl">{stats.passed}</p><p className="text-sm">{t('pass')}</p></div></div>
                    <div className="bg-red-50 dark:bg-red-900/50 p-6 rounded-lg flex items-center gap-4"><XCircleIcon className="w-8 h-8 text-red-500"/><div className="font-bold"><p className="text-3xl">{stats.failed}</p><p className="text-sm">{t('fail')}</p></div></div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg flex items-center gap-4"><SlashCircleIcon className="w-8 h-8 text-gray-500"/><div className="font-bold"><p className="text-3xl">{stats.na}</p><p className="text-sm">{t('notApplicable')}</p></div></div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">{t('detailedFindings')}</h3>
                <div className="space-y-3">
                    {survey.results.map(result => {
                        const item = project.checklist.find(c => c.id === result.checklistItemId);
                        return (
                            <div key={result.checklistItemId} className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg border-l-4" style={{borderLeftColor: result.result === 'Pass' ? '#22c55e' : result.result === 'Fail' ? '#ef4444' : '#6b7280'}}>
                                <p className="font-semibold">{item?.item}</p>
                                <p className="text-xs text-gray-500">{t('standard')}: {item?.standardId}</p>
                                {result.notes && <p className="text-sm mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"><strong>{t('surveyorNotes')}:</strong> {result.notes}</p>}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default SurveyReportPage;
