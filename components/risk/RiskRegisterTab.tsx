import React, { useState } from 'react';
import { Risk, User, TrainingProgram } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import RiskMatrix from './RiskMatrix';
import RiskModal from './RiskModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { PencilIcon, PlusIcon, TrashIcon } from '../icons';

interface RiskRegisterTabProps {
  risks: Risk[];
  users: User[];
  trainingPrograms: TrainingProgram[];
  onAdd: (risk: Omit<Risk, 'id'>) => void;
  onUpdate: (risk: Risk) => void;
  onDelete: (riskId: string) => void;
}

const RiskRegisterTab: React.FC<RiskRegisterTabProps> = (props) => {
    const { risks, users, trainingPrograms, onAdd, onUpdate, onDelete } = props;
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
    const [deletingRisk, setDeletingRisk] = useState<Risk | null>(null);

    const handleSave = (risk: Risk | Omit<Risk, 'id'>) => {
        if ('id' in risk) { onUpdate(risk); } else { onAdd(risk); }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if(deletingRisk) { onDelete(deletingRisk.id); setDeletingRisk(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => { setEditingRisk(null); setIsModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-semibold shadow-sm">
                    <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addNewRisk')}
                </button>
            </div>
            
            <RiskMatrix risks={risks} />
            
             <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-brand-border">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('riskTitle')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('likelihood')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('impact')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('owner')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-brand-surface divide-y divide-gray-200 dark:divide-dark-brand-border">
                            {risks.map(risk => (
                                <tr key={risk.id}>
                                    <td className="px-6 py-4 max-w-sm"><p className="font-medium truncate" title={risk.title}>{risk.title}</p></td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{risk.status}</span></td>
                                    <td className="px-6 py-4">{risk.likelihood}</td>
                                    <td className="px-6 py-4">{risk.impact}</td>
                                    <td className="px-6 py-4">{users.find(u => u.id === risk.ownerId)?.name || t('unassigned')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingRisk(risk); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingRisk(risk)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <RiskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} users={users} trainingPrograms={trainingPrograms} existingRisk={editingRisk} />}
            {deletingRisk && <ConfirmationModal isOpen={!!deletingRisk} onClose={() => setDeletingRisk(null)} onConfirm={handleDelete} title={t('deleteRisk')} message={t('areYouSureDeleteRisk')} confirmationText={t('delete')} />}
        </div>
    );
};

export default RiskRegisterTab;
