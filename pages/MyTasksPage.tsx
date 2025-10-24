import React, { useMemo, useState } from 'react';
import { Project, User, ChecklistItem, ComplianceStatus, NavigationState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ClipboardDocumentCheckIcon, SearchIcon } from '../components/icons';
import EmptyState from '../components/common/EmptyState';

interface MyTasksPageProps {
  projects: Project[];
  currentUser: User;
  setNavigation: (state: NavigationState) => void;
}

const MyTasksPage: React.FC<MyTasksPageProps> = ({ projects, currentUser, setNavigation }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const myTasks = useMemo(() => {
        return projects.flatMap(p => 
            p.checklist
                .filter(item => item.assignedTo === currentUser.id && item.status !== ComplianceStatus.Compliant && item.status !== ComplianceStatus.NotApplicable)
                .map(item => ({...item, projectName: p.name, projectId: p.id}))
        )
        .filter(task => task.item.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [projects, currentUser, searchTerm]);

    const statusInfo: Record<ComplianceStatus, { text: string; color: string }> = {
        [ComplianceStatus.Compliant]: { text: t('compliant'), color: 'bg-green-100 text-green-800' },
        [ComplianceStatus.PartiallyCompliant]: { text: t('partiallyCompliant'), color: 'bg-yellow-100 text-yellow-800' },
        [ComplianceStatus.NonCompliant]: { text: t('nonCompliant'), color: 'bg-red-100 text-red-800' },
        [ComplianceStatus.NotApplicable]: { text: t('notApplicable'), color: 'bg-gray-100 text-gray-800' },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-brand-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{t('myTasks')}</h1>
                    <p className="text-brand-text-secondary mt-1">{t('myTasksDescription')}</p>
                </div>
            </div>

            <div className="relative flex-grow">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* FIX: Cast translation key to any */}
                <input type="text" placeholder={t('searchTasks' as any)} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border rounded-lg" />
            </div>

            {myTasks.length > 0 ? (
                <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('taskDescription')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                                {myTasks.map(task => (
                                    <tr 
                                        key={task.id} 
                                        onClick={() => setNavigation({ view: 'projectDetail', projectId: task.projectId })}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo[task.status]?.color}`}>{statusInfo[task.status]?.text}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{task.item}</p>
                                            <p className="text-xs text-gray-500">{t('standard')}: {task.standardId}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{task.projectName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState icon={ClipboardDocumentCheckIcon} title={t('noTasksAssigned')} message="" />
            )}
        </div>
    );
};

export default MyTasksPage;
