import React from 'react';
import { Project, User, ComplianceStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface TeamMemberDashboardProps {
  currentUser: User;
  allProjects: Project[];
}

const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ currentUser, allProjects }) => {
    const { t } = useTranslation();
    const myTasks = allProjects.flatMap(p => p.checklist.filter(c => c.assignedTo === currentUser.id && c.status !== ComplianceStatus.Compliant && c.status !== ComplianceStatus.NotApplicable));
    return (
      <div className="p-4 bg-brand-surface dark:bg-dark-brand-surface rounded-lg">
        <h3 className="font-bold text-lg">{t('teamMemberDashboardTitle')}</h3>
         <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('myOpenTasks')}</p>
                <p className="text-2xl font-bold">{myTasks.length}</p>
            </div>
        </div>
    </div>
    );
};
export default TeamMemberDashboard;
