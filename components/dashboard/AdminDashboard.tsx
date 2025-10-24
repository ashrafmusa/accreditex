import React from 'react';
import { Project, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminDashboardProps {
  projects: Project[];
  users: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, users }) => {
    const { t } = useTranslation();
    return (
      <div className="p-4 bg-brand-surface dark:bg-dark-brand-surface rounded-lg">
        <h3 className="font-bold text-lg">{t('admin')} {t('dashboard')}</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('totalProjects')}</p>
                <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('users')}</p>
                <p className="text-2xl font-bold">{users.length}</p>
            </div>
        </div>
    </div>
    );
};
export default AdminDashboard;
