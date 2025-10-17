
import React, { useState } from 'react';
import { Risk, User, TrainingProgram, UserRole } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { PlusIcon, PencilIcon, TrashIcon } from '../icons';
import RiskMatrix from './RiskMatrix';
import RiskModal from './RiskModal';

interface Props {
  risks: Risk[];
  users: User[];
  trainingPrograms: TrainingProgram[];
  currentUser: User;
  onCreateRisk: (risk: Omit<Risk, 'id'>) => void;
  onUpdateRisk: (risk: Risk) => void;
  onDeleteRisk: (riskId: string) => void;
}

const getRiskLevel = (score: number) => {
    if (score >= 20) return { name: 'veryHigh', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' };
    if (score >= 13) return { name: 'high', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' };
    if (score >= 6) return { name: 'medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' };
    return { name: 'low', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' };
};

const RiskRegisterTab: React.FC<Props> = ({ risks, users, trainingPrograms, currentUser, onCreateRisk, onUpdateRisk, onDeleteRisk }) => {
  const { t } = useTranslation();
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  const canModify = currentUser.role === UserRole.Admin || currentUser.role === UserRole.ProjectLead;

  const handleSave = (riskData: Risk | Omit<Risk, 'id'>) => {
    if ('id' in riskData) onUpdateRisk(riskData);
    else onCreateRisk(riskData);
    setIsRiskModalOpen(false);
  };
  
  const handleDelete = (riskId: string) => {
    if (window.confirm(t('areYouSureDeleteRisk'))) onDeleteRisk(riskId);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            {canModify && <button onClick={() => { setEditingRisk(null); setIsRiskModalOpen(true); }} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-semibold shadow-sm"><PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />{t('addNewRisk')}</button>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><RiskMatrix risks={risks} /></div>
            <div className="lg:col-span-2 bg-brand-surface dark:bg-dark-brand-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('riskTitle')}</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('riskScore')}</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map(risk => {
                                const score = risk.likelihood * risk.impact;
                                const level = getRiskLevel(score);
                                return (
                                    <tr key={risk.id} className="border-b dark:border-dark-brand-border">
                                        <td className="px-4 py-3 font-medium">{risk.title}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${level.color}`}>{score} - {t(level.name as any)}</span></td>
                                        <td className="px-4 py-3 text-sm">{risk.status}</td>
                                        <td className="px-4 py-3 text-right">
                                            {canModify && <div className="flex items-center justify-end gap-2"><button onClick={() => { setEditingRisk(risk); setIsRiskModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-primary"><PencilIcon className="w-4 h-4" /></button><button onClick={() => handleDelete(risk.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button></div>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {risks.length === 0 && <p className="text-center text-sm py-8 text-gray-500">{t('noRisksLogged')}</p>}
                </div>
            </div>
        </div>
        {isRiskModalOpen && <RiskModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} onSave={handleSave} users={users} trainingPrograms={trainingPrograms} existingRisk={editingRisk} />}
    </div>
  );
};

export default RiskRegisterTab;
