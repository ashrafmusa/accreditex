import React, { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useAppStore } from '../stores/useAppStore';
import { useUserStore } from '../stores/useUserStore';
import { useTranslation } from '../hooks/useTranslation';
import { FolderIcon, PlusIcon, SearchIcon } from '../components/icons';
import ProjectCard from '../components/projects/ProjectCard';
import { ProjectStatus, UserRole } from '../types';
import EmptyState from '../components/common/EmptyState';
import { getStatusTranslationKey } from '../utils/translations';

const ProjectListPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects } = useProjectStore();
  const { setNavigation, programs } = useAppStore();
  const { currentUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const canCreate = currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.ProjectLead;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions: (ProjectStatus | 'all')[] = ['all', ProjectStatus.InProgress, ProjectStatus.NotStarted, ProjectStatus.OnHold, ProjectStatus.Completed, ProjectStatus.Finalized];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <FolderIcon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">{t('accreditationProjects')}</h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('projectsPageDescription')}</p>
          </div>
        </div>
        {canCreate && (
          <button
            onClick={() => setNavigation({ view: 'createProject' })}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full md:w-auto"
          >
            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t('createNewProject')}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchProjects')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ltr:pl-10 rtl:pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          className="w-full md:w-48 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-700 text-sm dark:text-white"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? t('allStatuses') : t(getStatusTranslationKey(status))}
            </option>
          ))}
        </select>
      </div>
      
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              programName={programs.find(p => p.id === project.programId)?.name || 'Unknown'}
              onSelect={() => setNavigation({ view: 'projectDetail', projectId: project.id })}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={FolderIcon}
          title={t('noProjectsFound')}
          message={t('noProjectsFoundMessage')}
        />
      )}
    </div>
  );
};

export default ProjectListPage;