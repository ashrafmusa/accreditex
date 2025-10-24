import React, { useMemo, useState } from 'react';
import { Project, CAPAReport, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import CapaModal from './CapaModal';
import { PencilIcon } from '../icons';

interface CapaReportsTabProps {
  projects: Project[];
  users: User[];
  onUpdateCapa: (projectId: string, capa: CAPAReport) => void;
}

const CapaReportsTab: React.FC<CapaReportsTabProps> = ({ projects, users, onUpdateCapa }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapa, setEditingCapa] = useState<(CAPAReport & { projectId: string }) | null>(null);

  const allCapas = useMemo(() => 
    projects.flatMap(p => 
      p.capaReports.map(c => ({
        ...c,
        projectId: p.id,
        projectName: p.name,
        assigneeName: users.find(u => u.id === c.assignedTo)?.name || t('unassigned'),
      }))
    ),
  [projects, users, t]);
  
  const handleSave = (capa: Omit<CAPAReport, 'id'>, projectId: string) => {
    onUpdateCapa(projectId, capa as CAPAReport);
    setIsModalOpen(false);
  };

  return (
    <>
        <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('description')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('project')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('assignedTo')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('dueDate')}</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                        {allCapas.map(capa => (
                            <tr key={capa.id}>
                                <td className="px-6 py-4">{capa.description}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${capa.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{t(capa.status.toLowerCase() as any)}</span></td>
                                <td className="px-6 py-4">{capa.projectName}</td>
                                <td className="px-6 py-4">{capa.assigneeName}</td>
                                <td className="px-6 py-4">{capa.dueDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setEditingCapa(capa)} className="text-gray-500 hover:text-brand-primary"><PencilIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allCapas.length === 0 && <p className="text-center py-8 text-gray-500">{t('noCapaReports')}</p>}
            </div>
        </div>
        {isModalOpen && <CapaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} users={users} existingCapa={editingCapa} />}
    </>
  );
};

export default CapaReportsTab;
