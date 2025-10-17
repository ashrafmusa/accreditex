import React from 'react';
import { Project, User, UserRole, ProjectStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
    project: Project;
    programName: string;
    currentUser: User;
    onFinalize: () => void;
    onGenerateReport: () => void;
}

const ProjectDetailHeader: React.FC<Props> = ({ project, programName, currentUser, onFinalize, onGenerateReport }) => {
    const { t } = useTranslation();

    const isFinalized = project.status === ProjectStatus.Finalized;
    const canModify = (currentUser.role === UserRole.Admin || currentUser.id === project.projectLead.id);

    const programColors: { [key: string]: string } = {
        'JCI': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        'DNV': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
        'HFAP': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        'CBAHI': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        'GAHAR': 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
        'DOH': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        'NHRA': 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
        'OSAHI': 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
        'OHAP': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    };

    return (
        <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
          <div className="flex justify-between items-start">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${programColors[programName] || 'bg-gray-100 text-gray-700'}`}>{programName}</span>
            {isFinalized && project.finalizedBy && project.finalizationDate && (
              <div className="text-sm text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/50 px-3 py-1 rounded-full font-semibold">
                {t('signedBy').replace('{name}', project.finalizedBy).replace('{date}', new Date(project.finalizationDate).toLocaleDateString())}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h1 className="text-3xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary mt-2">{project.name}</h1>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button onClick={onGenerateReport} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-brand-text-primary dark:text-dark-brand-text-primary px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold shadow-sm w-full sm:w-auto text-sm">{t('generateReport')}</button>
                {canModify && !isFinalized && <button onClick={onFinalize} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow-sm w-full sm:w-auto text-sm">{t('finalizeProject')}</button>}
              </div>
          </div>

          <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('status')}: {t((project.status.charAt(0).toLowerCase() + project.status.slice(1).replace(/\s/g, '')) as any)}</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-brand-text-secondary dark:text-dark-brand-text-secondary">{t('overallCompliance')}</span><span className="text-sm font-bold text-brand-primary">{Math.round(project.progress)}%</span></div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div></div>
          </div>
        </div>
    );
};

export default ProjectDetailHeader;