

import React, { useMemo } from 'react';
import { Project, MockSurvey, User, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '../components/icons';
import { useTheme } from '../components/common/ThemeProvider';

interface SurveyReportPageProps {
  project: Project;
  survey: MockSurvey;
  users: User[];
  surveyor?: User;
  onApplyFindings: (projectId: string, surveyId: string) => void;
  setNavigation: (state: NavigationState) => void;
}

const SurveyReportPage: React.FC<SurveyReportPageProps> = ({ project, survey, surveyor, users, onApplyFindings, setNavigation }) => {
  const { t, lang } = useTranslation();
  const { theme } = useTheme();
  
  const reportData = useMemo(() => {
    const passCount = survey.results.filter(r => r.result === 'Pass').length;
    const failCount = survey.results.filter(r => r.result === 'Fail').length;
    const naCount = survey.results.filter(r => r.result === 'Not Applicable').length;
    const totalScored = passCount + failCount;
    const score = totalScored > 0 ? Math.round((passCount / totalScored) * 100) : 0;
    
    const chartData = [
        { name: t('pass'), value: passCount },
        { name: t('fail'), value: failCount },
        { name: t('notApplicable'), value: naCount },
    ];

    const findings = survey.results
        .filter(r => r.result === 'Fail')
        .map(finding => {
            const checklistItem = project.checklist.find(c => c.id === finding.checklistItemId);
            return { ...finding, item: checklistItem };
        });

    return { score, chartData, findings, passCount, failCount, naCount, totalItems: survey.results.length };
  }, [survey, project.checklist, t]);

  const COLORS = {
      [t('pass')]: '#22C55E', // Green
      [t('fail')]: '#EF4444', // Red
      [t('notApplicable')]: '#9CA3AF' // Gray
  };
  
  const handleApplyFindings = () => {
    if (window.confirm(t('applyFindingsConfirm'))) {
        onApplyFindings(project.id, survey.id);
    }
  };

  const tooltipStyle = {
    borderRadius: '0.5rem',
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          #report-content, .printable-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0;
          }
           .printable-text-primary { color: #0f172a !important; }
           .printable-text-secondary { color: #64748b !important; }
        }
      `}</style>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <header className="bg-brand-surface dark:bg-dark-brand-surface shadow-md no-print">
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                 <div>
                    <h1 className="text-xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">{t('surveyReport')}</h1>
                    <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{project.name}</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setNavigation({ view: 'projectDetail', projectId: project.id })} className="text-sm font-semibold text-brand-primary hover:underline">
                        {t('backToProject')}
                    </button>
                    <button onClick={() => window.print()} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                        {t('printReport')}
                    </button>
                 </div>
            </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" id="report-content">
            <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-t-lg p-8 border-x border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary printable-text-primary">{t('surveyResults')}</h2>
                <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1 printable-text-secondary">{project.name}</p>
            </div>
            
            <div className="bg-brand-surface dark:bg-dark-brand-surface p-8 border-x border-b border-gray-200 dark:border-gray-700 space-y-8">
                <div className="printable-card bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-brand-text-primary dark:text-dark-brand-text-primary printable-text-primary">{t('surveyDetails')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div><p className="text-gray-500 dark:text-gray-400 printable-text-secondary">{t('surveyor')}</p><p className="font-semibold mt-1 printable-text-primary">{surveyor?.name || 'Unknown'}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 printable-text-secondary">{t('dateConducted')}</p><p className="font-semibold mt-1 printable-text-primary">{new Date(survey.date).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-US')}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 printable-text-secondary">{t('itemsReviewed')}</p><p className="font-semibold mt-1 printable-text-primary">{reportData.totalItems}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 printable-text-secondary">{t('overallScore')}</p><p className="font-bold text-2xl text-brand-primary mt-1">{reportData.score}%</p></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={reportData.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {reportData.chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="lg:col-span-3">
                         <div className="space-y-4">
                            <div className="flex items-center gap-4"><CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" /><div><p className="font-bold">{t('pass')}</p><p className="text-sm">{reportData.passCount} {t('itemsReviewed')}</p></div></div>
                            <div className="flex items-center gap-4"><XCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0" /><div><p className="font-bold">{t('fail')}</p><p className="text-sm">{reportData.failCount} {t('itemsReviewed')}</p></div></div>
                            <div className="flex items-center gap-4"><MinusCircleIcon className="w-8 h-8 text-gray-500 flex-shrink-0" /><div><p className="font-bold">{t('notApplicable')}</p><p className="text-sm">{reportData.naCount} {t('itemsReviewed')}</p></div></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-b-lg p-8 border-x border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-brand-text-primary dark:text-dark-brand-text-primary printable-text-primary">{t('findings')} ({reportData.findings.length})</h3>
                <div className="space-y-4">
                    {reportData.findings.length > 0 ? (
                        reportData.findings.map(finding => {
                            const originalAssignee = users.find(u => u.id === finding.item?.assignedTo);
                            return (
                            <div key={finding.checklistItemId} className="printable-card p-4 rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
                                <p className="font-semibold text-red-800 dark:text-red-200 printable-text-primary">{finding.item?.standardId}</p>
                                <p className="text-sm mt-1 text-red-700 dark:text-red-300 printable-text-secondary">{finding.item?.item}</p>
                                {finding.notes && <p className="mt-2 text-sm text-red-900 dark:text-red-100 border-t border-red-200 dark:border-red-800 pt-2"><strong className="printable-text-secondary">{t('surveyorNotes')}:</strong> {finding.notes}</p>}
                            </div>
                        )})
                    ) : <p className="text-center text-sm text-gray-500 py-10 printable-text-secondary">{t('noFindings')}</p>}
                </div>
                <div className="mt-8 flex justify-end no-print">
                    <button onClick={handleApplyFindings} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-semibold shadow-sm w-full md:w-auto">{t('applyFindings')}</button>
                </div>
            </div>

        </main>
      </div>
    </>
  );
};

export default SurveyReportPage;
