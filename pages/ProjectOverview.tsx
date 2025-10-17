


import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Project, ComplianceStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { CheckCircleIcon, ClockIcon, FolderIcon } from '../components/icons';
import StatCard from '../components/common/StatCard';

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
    const { t, lang } = useTranslation();

    const stats = useMemo(() => {
        const totalTasks = project.checklist.length;
        const completedTasks = project.checklist.filter(c => c.status === ComplianceStatus.Compliant).length;
        const compliance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const today = new Date();
        const endDate = project.endDate ? new Date(project.endDate) : null;
        let daysRemaining: number | string = 'N/A';
        if (endDate && endDate > today) {
            daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        return { compliance, completedTasks, totalTasks, daysRemaining };
    }, [project]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('complianceRate')} value={`${stats.compliance}%`} icon={CheckCircleIcon} color="bg-brand-success" />
                <StatCard title={t('tasksCompleted')} value={`${stats.completedTasks} / ${stats.totalTasks}`} icon={FolderIcon} color="bg-brand-primary" />
                <StatCard title={t('daysRemaining')} value={stats.daysRemaining} icon={ClockIcon} color="bg-brand-warning" />
            </div>

            <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
                <h3 className="text-lg font-semibold text-brand-text-primary dark:text-dark-brand-text-primary mb-4">{t('recentActivity')}</h3>
                <ul className="space-y-4">
                    {project.activityLog.slice(0, 10).map(log => (
                        <li key={log.id} className="flex items-start space-x-3 rtl:space-x-reverse border-b dark:border-dark-brand-border pb-3 last:border-b-0">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-brand-primary dark:text-indigo-300 flex items-center justify-center font-bold flex-shrink-0">
                                {log.user.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm dark:text-dark-brand-text-primary">
                                    <span className="font-semibold">{log.user}</span> {log.action[lang]}
                                </p>
                                {log.details?.[lang] && <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{log.details[lang]}</p>}
                                <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">
                                    {new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProjectOverview;