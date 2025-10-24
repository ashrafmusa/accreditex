
import React, { useMemo, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Project } from '../types';
import { BeakerIcon, PlusIcon } from '../components/icons';
import EmptyState from '../components/common/EmptyState';

interface DesignControlsPageProps {
    projects: Project[];
}

const DesignControlsPage: React.FC<DesignControlsPageProps> = ({ projects }) => {
    const { t } = useTranslation();
    const [projectFilter, setProjectFilter] = useState('all');

    const allItems = useMemo(() => {
        return projects.flatMap(p => 
            p.designControls.map(item => ({
                ...item,
                projectId: p.id,
                projectName: p.name,
            }))
        )
        .filter(item => projectFilter === 'all' || item.projectId === projectFilter);
    }, [projects, projectFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
                    <BeakerIcon className="h-8 w-8 text-brand-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('designControls')}</h1>
                        <p className="text-brand-text-secondary mt-1">{t('designControlsHubDescription')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="border rounded-lg py-2 px-3">
                        <option value="all">{t('allProjects')}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm">
                        <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> {t('newItem')}
                    </button>
                </div>
            </div>
            
            {allItems.length > 0 ? (
                 <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userNeed')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('designInput')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('designOutput')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project')}</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-gray-200 dark:divide-dark-brand-border">
                                {allItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm">{item.userNeed}</td>
                                        <td className="px-4 py-3 text-sm">{item.designInput}</td>
                                        <td className="px-4 py-3 text-sm">{item.designOutput}</td>
                                        <td className="px-4 py-3 text-sm">{item.projectName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : <EmptyState icon={BeakerIcon} title={t('noDesignControls')} message="" />}
        </div>
    );
};

export default DesignControlsPage;
