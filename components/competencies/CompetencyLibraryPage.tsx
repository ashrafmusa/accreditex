import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { PlusIcon, TrashIcon, PencilIcon } from '../icons';
import { Competency } from '../../types';
import CompetencyModal from './CompetencyModal';
import ConfirmationModal from '../common/ConfirmationModal';

const CompetencyLibraryPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const { competencies, addCompetency, updateCompetency, deleteCompetency } = useAppStore();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
    const [deletingCompetency, setDeletingCompetency] = useState<Competency | null>(null);

    const handleSave = (comp: Competency | Omit<Competency, 'id'>) => {
        if ('id' in comp) { updateCompetency(comp); } else { addCompetency(comp); }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deletingCompetency) { deleteCompetency(deletingCompetency.id); setDeletingCompetency(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold">{t('competencyLibrary')}</h2>
                <button onClick={() => { setEditingCompetency(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addCompetency')}
                </button>
            </div>
            
            <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {/* FIX: Cast translation key to any */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('competency' as any)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('description')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                            {competencies.map(comp => (
                                <tr key={comp.id}>
                                    <td className="px-6 py-4 font-medium">{comp.name[lang]}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{comp.description[lang]}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingCompetency(comp); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingCompetency(comp)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <CompetencyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} existingCompetency={editingCompetency} />}
            {deletingCompetency && <ConfirmationModal isOpen={!!deletingCompetency} onClose={() => setDeletingCompetency(null)} onConfirm={handleDelete} title={t('deleteCompetency')} message={t('areYouSureDeleteCompetency')} confirmationText={t('delete')} />}
        </div>
    );
};

export default CompetencyLibraryPage;