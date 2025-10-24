import React from 'react';
import { Project, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ProjectLeadDashboardProps {
  currentUser: User;
  allProjects: Project[];
}

const ProjectLeadDashboard: React.FC<ProjectLeadDashboardProps> = ({ currentUser, allProjects }) => {
    const { t } = useTranslation();
    const myProjects = allProjects.filter(p => p.projectLead.id === currentUser.id);
    return (
      <div className="p-4 bg-brand-surface dark:bg-dark-brand-surface rounded-lg">
        <h3 className="font-bold text-lg">{t('projectLeadDashboardTitle')}</h3>
         <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('myProjects')}</p>
                <p className="text-2xl font-bold">{myProjects.length}</p>
            </div>
        </div>
    </div>
    );
};
export default ProjectLeadDashboard;
