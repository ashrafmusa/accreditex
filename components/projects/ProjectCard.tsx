import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { programColorMap } from '../ui/constants';

interface ProjectCardProps {
  project: Project;
  programName: string;
  onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, programName, onSelect }) => {
  const { t } = useTranslation();

  const statusInfo: Record<ProjectStatus, { text: string, color: string }> = {
    [ProjectStatus.InProgress]: { text: t('inProgress'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    [ProjectStatus.NotStarted]: { text: t('notStarted'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    [ProjectStatus.OnHold]: { text: t('onHold'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
    [ProjectStatus.Completed]: { text: t('completed'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    [ProjectStatus.Finalized]: { text: t('finalized'), color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  };

  return (
    <div 
        onClick={onSelect}
        className="bg-brand-surface dark:bg-dark-brand-surface rounded-xl shadow-sm border border-brand-border dark:border-dark-brand-border hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${programColorMap[programName] || 'bg-gray-100 text-gray-700'}`}>{programName}</span>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo[project.status]?.color || 'bg-gray-100 text-gray-800'}`}>{statusInfo[project.status]?.text}</span>
        </div>
        <h3 className="text-lg font-bold text-brand-text-primary dark:text-dark-brand-text-primary mt-3">{project.name}</h3>
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                {/* FIX: Cast translation key to any */}
                <span className="text-sm font-medium text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('compliance' as any)}</span>
                <span className="text-sm font-bold text-brand-primary">{Math.round(project.progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
        </div>
      </div>
      <div className="border-t dark:border-dark-brand-border bg-slate-50 dark:bg-slate-900/50 px-5 py-3 flex justify-between items-center rounded-b-xl">
        <div className="text-sm">
            <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('projectLead')}</p>
            <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{project.projectLead.name}</p>
        </div>
        <span className="text-sm font-semibold text-brand-primary-600 dark:text-brand-primary-400 hover:underline">{t('viewDetails')}</span>
      </div>
    </div>
  );
};

export default ProjectCard;