
import React, { useMemo, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Project } from '../types';
import { ClockIcon, SearchIcon } from '../components/icons';
import EmptyState from '../components/common/EmptyState';

interface AuditLogPageProps {
    projects: Project[];
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({ projects }) => {
    const { t, lang } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const aggregatedLog = useMemo(() => {
        return projects.flatMap(p => 
            p.activityLog.map(log => ({
                ...log,
                projectId: p.id,
                projectName: p.name,
            }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter(log => 
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.projectName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, lang, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <ClockIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{t('auditLog')}</h1>
                    <p className="text-brand-text-secondary mt-1">{t('auditLogDescription')}</p>
                </div>
            </div>

             <div className="relative flex-grow">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder={t('searchLogs')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border rounded-lg" />
            </div>

            {aggregatedLog.length > 0 ? (
                <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('timestamp')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('action')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project')}</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                                {aggregatedLog.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.user}</td>
                                        <td className="px-6 py-4 text-sm">{log.action[lang]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.projectName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : <EmptyState icon={ClockIcon} title={t('noActivity')} message="" />}
        </div>
    );
};

export default AuditLogPage;
