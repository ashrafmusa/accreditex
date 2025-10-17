
import React, { useState, useMemo } from 'react';
import { Project, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  projects: Project[];
  users: User[];
}

const CapaReportsTab: React.FC<Props> = ({ projects, users }) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  const allCapaReports = useMemo(() => 
    projects.flatMap(p => p.capaReports.map(capa => ({ ...capa, projectName: p.name }))), 
  [projects]);
  
  const filteredCapaReports = useMemo(() => 
    allCapaReports.filter(capa => 
      (statusFilter === 'All' || capa.status === statusFilter) &&
      (typeFilter === 'All' || capa.type === typeFilter) &&
      (projectFilter === 'All' || capa.sourceProjectId === projectFilter)
    ), 
  [allCapaReports, statusFilter, typeFilter, projectFilter]);

  const selectClasses = "w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-700 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border flex flex-col sm:flex-row flex-wrap items-center gap-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClasses}><option value="All">{t('allStatuses')}</option><option value="Open">{t('open')}</option><option value="Closed">{t('closed')}</option></select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectClasses}><option value="All">{t('allTypes')}</option><option value="Corrective">{t('corrective')}</option><option value="Preventive">{t('preventive')}</option></select>
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className={selectClasses}><option value="All">{t('allProjects')}</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
      <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('source')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('capaType')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('assignedTo')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('dueDate')}</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                {filteredCapaReports.map((capa) => {
                    const assignee = users.find(u => u.id === capa.assignedTo);
                    return (
                    <tr key={capa.id}>
                        <td className="px-6 py-4"><p className="font-semibold">{capa.sourceStandardId}</p><p className="text-xs text-gray-500">{capa.projectName}</p></td>
                        <td className="px-6 py-4 text-sm">{capa.type}</td>
                        <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${capa.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{capa.status}</span></td>
                        <td className="px-6 py-4 text-sm">{assignee?.name || t('unassigned')}</td>
                        <td className="px-6 py-4 text-sm">{new Date(capa.dueDate).toLocaleDateString()}</td>
                    </tr>
                    )
                })}
                </tbody>
            </table>
            {filteredCapaReports.length === 0 && <p className="text-center py-8 text-gray-500">{t('noCapaReports')}</p>}
        </div>
      </div>
    </div>
  );
};

export default CapaReportsTab;
