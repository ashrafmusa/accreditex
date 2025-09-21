
import React, { useMemo } from 'react';
import { Project, User, AccreditationProgram, ComplianceStatus } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { UsersIcon, CheckCircleIcon, ClockIcon } from '@/components/icons';

interface MyTasksPageProps {
  projects: Project[];
  currentUser: User;
  programs: AccreditationProgram[];
}

const MyTasksPage: React.FC<MyTasksPageProps> = ({ projects, currentUser, programs }) => {
  const { t } = useTranslation();

  const myTasks = useMemo(() => {
    return projects.flatMap(project => {
        const program = programs.find(p => p.id === project.programId);
        return project.checklist
            .filter(item => item.assignedTo === currentUser.id)
            .map(item => ({ ...item, projectName: project.name, projectProgram: program?.name || '' }))
    });
  }, [projects, currentUser, programs]);

  const completedTasks = myTasks.filter(task => task.status === ComplianceStatus.Compliant).length;
  const pendingTasks = myTasks.length - completedTasks;

  const statusInfo: Record<ComplianceStatus, { text: string, color: string }> = {
    [ComplianceStatus.Compliant]: { text: t('compliant'), color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    [ComplianceStatus.PartiallyCompliant]: { text: t('partiallyCompliant'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    [ComplianceStatus.NonCompliant]: { text: t('nonCompliant'), color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    [ComplianceStatus.NotApplicable]: { text: t('notApplicable'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <UsersIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('myTasks')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('myTasksDescription')}</p>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center text-green-600 dark:text-green-400"><CheckCircleIcon className="h-5 w-5 mr-1"/>{completedTasks} {t('completed')}</div>
            <div className="flex items-center text-orange-600 dark:text-orange-400"><ClockIcon className="h-5 w-5 mr-1"/>{pendingTasks} {t('pending')}</div>
        </div>
      </div>

      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('taskDescription')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rtl:text-right">{t('project')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
              {myTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo[task.status].color}`}>{statusInfo[task.status].text}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-brand-text-primary dark:text-dark-brand-text-primary">{task.item}</p>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('standard')}: {task.standardId}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-brand-text-primary dark:text-dark-brand-text-primary">{task.projectName}</p>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{task.projectProgram}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myTasks.length === 0 && <p className="text-center py-8 text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('noTasksAssigned')}</p>}
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;